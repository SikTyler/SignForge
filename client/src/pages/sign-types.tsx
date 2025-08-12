import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MainLayout from "@/components/layout/main-layout";
import EmptyState from "@/components/common/empty-state";

interface SignTypesProps {
  projectId: string;
}

export default function SignTypes({ projectId }: SignTypesProps) {
  const { data: signTypes, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/sign-types`],
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'interior':
        return 'bg-blue-100 text-blue-800';
      case 'exterior':
        return 'bg-green-100 text-green-800';
      case 'monument':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MainLayout projectId={projectId}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!signTypes || signTypes.length === 0) {
    return (
      <MainLayout projectId={projectId}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign Types</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sign Type
          </Button>
        </div>
        <EmptyState
          icon={Layers}
          title="No sign types found"
          description="Get started by creating your first sign type with specifications."
          action={{
            label: "Add Sign Type",
            onClick: () => console.log("Add sign type"),
          }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout projectId={projectId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign Types</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sign Type
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signTypes.map((signType: any) => (
            <Card key={signType.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{signType.name}</h3>
                  <Badge className={`${getCategoryColor(signType.category)} border-0`}>
                    {signType.category}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spec Version:</span>
                    <span className="font-medium">{signType.specVersion || 'No spec'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Signs Count:</span>
                    <span className="font-medium">{signType.signCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-500">
                      {formatDistanceToNow(new Date(signType.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/sign-types/${signType.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Spec
                    </Button>
                  </Link>
                  <Link href={`/projects/${projectId}/signs?type=${signType.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200">
                      View Signs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
