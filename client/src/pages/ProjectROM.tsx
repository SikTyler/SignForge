import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign } from 'lucide-react';

export function ProjectROM() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ROM Estimates</h1>
          <p className="text-gray-600 mt-2">Generate Rough Order of Magnitude estimates</p>
        </div>
        <Button>
          <Calculator className="w-4 h-4 mr-2" />
          Create Estimate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimate available</h3>
              <p className="text-gray-600 mb-4">
                Create your first ROM estimate to get started
              </p>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Generate Estimate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax (8.5%):</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold text-green-600">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No previous estimates</p>
        </CardContent>
      </Card>
    </div>
  );
}
