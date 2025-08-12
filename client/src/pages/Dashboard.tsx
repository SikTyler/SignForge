import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to SignForge - Multifamily Signage Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drawings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Uploaded drawings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROM Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Generated estimates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">📁</div>
              <div className="font-medium">Create Project</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">📐</div>
              <div className="font-medium">Upload Drawings</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Generate ROM</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Code Summary</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
