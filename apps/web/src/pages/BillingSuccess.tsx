import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function BillingSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Invalidate billing queries to refresh status
    queryClient.invalidateQueries({ queryKey: ['billing'] })
  }, [queryClient])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your subscription has been activated. You now have access to all features.
          </p>
          {sessionId && (
            <p className="text-xs text-gray-500 mb-6">Session ID: {sessionId}</p>
          )}
          <Button onClick={() => navigate('/billing')} className="w-full">
            Go to Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
