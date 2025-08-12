import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmptyState from "@/components/common/empty-state";
import NewProjectDialog from "@/components/projects/new-project-dialog";

interface Project {
  id: string;
  name: string;
  address: string;
  clientOrg: string;
  status: string;
  logoPath: string | null;
  createdAt: string;
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const handleProjectCreated = (projectId: string) => {
    // Navigate to the new project
    setLocation(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <NewProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
          <EmptyState
            icon={Building2}
            title="No projects found"
            description="Get started by creating your first signage project."
            action={{
              label: "Create Project",
              onClick: () => handleProjectCreated(""),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <NewProjectDialog onProjectCreated={handleProjectCreated} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {project.address || "No address"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {project.clientOrg || "No client"}
                      </p>
                    </div>
                    {project.logoPath && (
                      <img
                        src={`/uploads/logos/${project.logoPath}`}
                        alt="Project logo"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        project.status === "active"
                          ? "default"
                          : project.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
