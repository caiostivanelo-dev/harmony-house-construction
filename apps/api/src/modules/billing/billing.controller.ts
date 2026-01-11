import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '../../common/enums/role.enum';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getStatus(@CurrentUser() user: any) {
    return this.billingService.getSubscription(user.companyId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCheckout(
    @CurrentUser() user: any,
    @Body() body: { planId: string },
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    
    const session = await this.billingService.createCheckoutSession(
      user.companyId,
      body.planId,
      `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      `${frontendUrl}/billing/cancel`,
    );

    return { sessionId: session.id, url: session.url };
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new BadRequestException('Missing webhook signature or secret');
    }

    const rawBody = req.rawBody || req.body;

    let event: Stripe.Event;

    try {
      event = this.billingService['stripe'].webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    await this.billingService.handleWebhook(event);

    res.json({ received: true });
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async syncStatus(@CurrentUser() user: any) {
    await this.billingService.syncSubscriptionStatus(user.companyId);
    return { message: 'Subscription status synced' };
  }
}
