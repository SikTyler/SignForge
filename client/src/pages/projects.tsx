import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
<<<<<<< HEAD
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  address: string;
  clientOrg: string;
  status: string;
  logoPath: string | null;
  createdAt: string;
}

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  address: z.string().optional(), 
  clientOrg: z.string().optional(),
  status: z.enum(["active", "pending", "completed", "on_hold"]).default("active"),
  logo: z.instanceof(File).optional()
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;
=======
import EmptyState from "@/components/common/empty-state";
>>>>>>> parent of 27122f1 (Add takeoff functionality for project sign management)

export default function Projects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          <EmptyState
            icon={Building2}
            title="No projects found"
            description="Get started by creating your first signage project."
            action={{
              label: "Create Project",
              onClick: () => console.log("Create project"),
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {project.name}
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.address}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Client:</span>
                      <span className="font-medium">{project.clientOrg}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </span>
                    </div>
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
