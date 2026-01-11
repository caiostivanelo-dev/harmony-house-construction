import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, Check, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: [
      'Up to 5 users',
      'Up to 10 projects',
      'Basic reporting',
      'Email support',
    ],
    limits: { maxUsers: 5, maxProjects: 10 },
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$99',
    period: '/month',
    features: [
      'Up to 25 users',
      'Up to 100 projects',
      'Advanced reporting',
      'Priority support',
      'PDF exports',
      'Email automation',
    ],
    limits: { maxUsers: 25, maxProjects: 100 },
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Custom integrations',
      'Dedicated support',
      'Custom features',
    ],
    limits: { maxUsers: Infinity, maxProjects: Infinity },
  },
]

export default function Billing() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: () => api.getBillingStatus(),
    enabled: !!user,
  })

  const syncMutation = useMutation({
    mutationFn: () => api.syncSubscriptionStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })

  const handleUpgrade = async (planId: string) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Only admins can manage billing')
      return
    }

    if (planId === 'ENTERPRISE') {
      alert('Please contact sales for Enterprise pricing')
      return
    }

    setLoadingPlan(planId)
    try {
      const { url } = await api.createCheckoutSession(planId)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setLoadingPlan(null)
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Trial</Badge>

    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-600">Active</Badge>
      case 'TRIALING':
        return <Badge variant="outline">Trial</Badge>
      case 'PAST_DUE':
        return <Badge variant="destructive">Past Due</Badge>
      case 'CANCELED':
        return <Badge variant="outline">Canceled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription and billing"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">You don't have permission to view billing settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription and billing"
        />
        <div className="text-center py-12 text-gray-500">Loading billing information...</div>
      </div>
    )
  }

  const currentPlan = PLANS.find((p) => p.id === subscription?.plan) || PLANS[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription plan and billing settings"
        action={
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Status
          </Button>
        }
      />

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Your current plan and billing status
              </p>
            </div>
            {getStatusBadge(subscription?.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold">
                  {subscription?.status === 'ACTIVE' ? (
                    <span className="text-green-600">Active</span>
                  ) : subscription?.status === 'TRIALING' ? (
                    <span className="text-blue-600">Trial</span>
                  ) : (
                    <span className="text-red-600">{subscription?.status || 'Trial'}</span>
                  )}
                </p>
              </div>
            </div>
            {subscription?.trialEndsAt && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id
            const isEnterprise = plan.id === 'ENTERPRISE'

            return (
              <Card
                key={plan.id}
                className={isCurrentPlan ? 'ring-2 ring-gray-900' : ''}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isEnterprise ? (
                        'Contact Sales'
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {subscription?.plan ? 'Switch Plan' : 'Subscribe'}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Method */}
      {subscription?.status === 'ACTIVE' && subscription?.stripeCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage your payment method and billing history in Stripe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
