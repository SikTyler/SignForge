import { useParams, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProjectOverview() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Mock project data
  const project = {
    id,
    name: 'Sunset Apartments',
    address: '123 Main St, Seattle, WA',
    status: 'active',
    clientOrg: 'Sunset Development LLC',
    createdAt: '2024-01-15',
  };

  const tabs = [
    { value: 'overview', label: 'Overview', path: `/projects/${id}` },
    { value: 'drawings', label: 'Drawings', path: `/projects/${id}/drawings` },
    { value: 'rom', label: 'ROM', path: `/projects/${id}/rom` },
    { value: 'code', label: 'Code', path: `/projects/${id}/code` },
    { value: 'rfqs', label: 'RFQs', path: `/projects/${id}/rfqs` },
  ];

  const currentTab = tabs.find(tab => location.pathname === tab.path)?.value || 'overview';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-600 mt-2">{project.address}</p>
      </div>

      <Tabs value={currentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <Link key={tab.value} to={tab.path} className="w-full">
              <TabsTrigger value={tab.value} className="w-full">
                {tab.label}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Client:</span>
                    <span className="ml-2 text-sm">{project.clientOrg}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="ml-2 text-sm">{project.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-600">Drawings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600">ROM Estimates</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-600">RFQs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
