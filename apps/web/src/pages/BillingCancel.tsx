import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function BillingCancel() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Canceled</h1>
          <p className="text-gray-600 mb-6">
            Your subscription was not changed. You can try again anytime.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/billing')} className="flex-1">
              Back to Billing
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
