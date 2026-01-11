import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  public readonly stripe: Stripe | null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    } else {
      this.stripe = null;
      console.warn('⚠️  STRIPE_SECRET_KEY not configured. Billing features will be disabled.');
    }
  }

  async createCustomer(companyId: string): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // If customer already exists, return it
    if (company.stripeCustomerId) {
      const customer = await this.stripe.customers.retrieve(company.stripeCustomerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      name: company.name,
      metadata: {
        companyId,
      },
    });

    // Save customer ID to company
    await this.prisma.company.update({
      where: { id: companyId },
      data: { stripeCustomerId: customer.id },
    });

    return customer;
  }

  async createCheckoutSession(
    companyId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Get or create Stripe customer
    let customerId = company.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(companyId);
      customerId = customer.id;
    }

    // Get plan price ID from config
    const priceId = this.getPriceIdForPlan(planId);
    if (!priceId) {
      throw new BadRequestException('Invalid plan');
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        companyId,
        planId,
      },
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const companyId = session.metadata?.companyId;
    const planId = session.metadata?.planId;

    if (!companyId) {
      return;
    }

    const subscription = session.subscription as string;
    const customer = session.customer as string;

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        stripeCustomerId: customer,
        stripeSubscriptionId: subscription,
        plan: planId || 'STARTER',
        subscriptionStatus: 'ACTIVE',
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!company) {
      return;
    }

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: subscription.status.toUpperCase(),
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const company = await this.prisma.company.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!company) {
      return;
    }

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: 'CANCELED',
        stripeSubscriptionId: null,
      },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) {
      return;
    }

    const company = await this.prisma.company.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!company) {
      return;
    }

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: 'PAST_DUE',
      },
    });
  }

  async syncSubscriptionStatus(companyId: string): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || !company.stripeSubscriptionId) {
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(company.stripeSubscriptionId);

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: subscription.status.toUpperCase(),
      },
    });
  }

  async getSubscription(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return null;
    }

    return {
      plan: company.plan || 'STARTER',
      status: company.subscriptionStatus || 'TRIALING',
      trialEndsAt: company.trialEndsAt,
      stripeCustomerId: company.stripeCustomerId,
      stripeSubscriptionId: company.stripeSubscriptionId,
    };
  }

  private getPriceIdForPlan(planId: string): string | null {
    const priceIds: Record<string, string> = {
      STARTER: this.configService.get<string>('STRIPE_PRICE_STARTER') || '',
      PRO: this.configService.get<string>('STRIPE_PRICE_PRO') || '',
    };

    return priceIds[planId] || null;
  }

  getPlanLimits(plan: string) {
    const limits: Record<string, { maxUsers: number; maxProjects: number }> = {
      STARTER: { maxUsers: 5, maxProjects: 10 },
      PRO: { maxUsers: 25, maxProjects: 100 },
      ENTERPRISE: { maxUsers: Infinity, maxProjects: Infinity },
    };

    return limits[plan] || limits.STARTER;
  }

  async checkCompanyPlanLimits(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: true,
        projects: true,
      },
    });

    if (!company) {
      return null;
    }

    const limits = this.getPlanLimits(company.plan || 'STARTER');
    const currentUsers = company.users.length;
    const currentProjects = company.projects.length;

    return {
      plan: company.plan || 'STARTER',
      limits,
      usage: {
        users: { current: currentUsers, limit: limits.maxUsers },
        projects: { current: currentProjects, limit: limits.maxProjects },
      },
      canAddUser: currentUsers < limits.maxUsers,
      canAddProject: currentProjects < limits.maxProjects,
    };
  }
}
