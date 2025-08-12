import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

export function ProjectDrawings() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drawings</h1>
          <p className="text-gray-600 mt-2">Upload and manage project drawings</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Drawings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drawing Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drawings uploaded</h3>
            <p className="text-gray-600 mb-4">
              Upload PDF drawings to get started with your project
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload First Drawing
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Supported format: PDF only</li>
              <li>• Maximum file size: 100MB per file</li>
              <li>• Multiple files can be uploaded at once</li>
              <li>• Files will be organized into drawing sets</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No recent uploads</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
