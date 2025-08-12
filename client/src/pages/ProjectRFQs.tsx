import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Building2 } from 'lucide-react';

export function ProjectRFQs() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFQs</h1>
          <p className="text-gray-600 mt-2">Manage vendor requests for quotes</p>
        </div>
        <Button>
          <Send className="w-4 h-4 mr-2" />
          Send RFQ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active RFQs</h3>
              <p className="text-gray-600 mb-4">
                Send your first RFQ to vendors to get started
              </p>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send RFQ
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors</h3>
              <p className="text-gray-600 mb-4">
                Add vendors to your directory to send RFQs
              </p>
              <Button variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFQ History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No previous RFQs</p>
        </CardContent>
      </Card>
    </div>
  );
}
