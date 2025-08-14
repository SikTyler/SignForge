import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Projects() {
  // Mock data for demonstration
  const projects = [
    {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Main St, Seattle, WA',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Downtown Lofts',
      address: '456 Oak Ave, Portland, OR',
      status: 'active',
      createdAt: '2024-01-10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your multifamily signage projects</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate">{project.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{project.address}</p>
              <p className="text-xs text-gray-500 mb-4">Created: {project.createdAt}</p>
              <Link 
                to={`/projects/${project.id}`}
                className="inline-block w-full"
              >
                <Button variant="outline" className="w-full">
                  View Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first project to get started with SignForge
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
