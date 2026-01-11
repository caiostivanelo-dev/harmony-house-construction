import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Document } from '@/lib/api'

interface DocumentCardProps {
  document: Document
  projectName?: string
  onClick?: () => void
}

export function DocumentCard({ document, projectName, onClick }: DocumentCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{document.type}</p>
            <p className="text-lg font-semibold text-gray-900">{document.number}</p>
            {projectName && (
              <p className="text-sm text-gray-500 mt-1">{projectName}</p>
            )}
          </div>
          <StatusBadge status={document.status as any} />
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="text-gray-900 font-semibold">
              ${document.totalValue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Balance:</span>
            <span className="text-gray-900">
              ${document.balanceDue.toLocaleString()}
            </span>
          </div>
          {document.sentDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sent:</span>
              <span className="text-gray-900">
                {new Date(document.sentDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {document.dueDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Due:</span>
              <span className="text-gray-900">
                {new Date(document.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
