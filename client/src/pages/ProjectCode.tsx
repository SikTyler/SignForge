import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function ProjectCode() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Summary</h1>
          <p className="text-gray-600 mt-2">Manage jurisdiction requirements and restrictions</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Create Summary
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No code summary</h3>
            <p className="text-gray-600 mb-4">
              Create a code summary to document requirements and restrictions
            </p>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Required Signage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No requirements defined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Allowances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No allowances defined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No restrictions defined</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
