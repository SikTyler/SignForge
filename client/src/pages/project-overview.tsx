import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, Plus, Eye, Send, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

interface ProjectOverviewProps {
  projectId: string;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: romPricing } = useQuery({
    queryKey: [`/api/projects/${projectId}/rom`],
  });

  const { data: codeSummary } = useQuery({
    queryKey: [`/api/projects/${projectId}/code-summary`],
  });

  const { data: examplePackages } = useQuery({
    queryKey: [`/api/projects/${projectId}/example-packages`],
  });

  if (projectLoading) {
    return (
      <MainLayout projectId={projectId}>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout projectId={projectId}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <MainLayout projectId={projectId}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.address}</p>
          </div>
          <div className="flex space-x-3">
            <Badge className={`${getStatusColor(project.status)} border-0`}>
              <Clock className="h-3 w-3 mr-1" />
              {project.status}
            </Badge>
          </div>
        </div>

        {/* ROM Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">ROM Pricing Summary</h2>
              <Button variant="outline" size="sm">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ${romPricing?.summaryTotal?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Estimate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700">
                  {(romPricing?.breakdownJson as any)?.signCount || 0}
                </div>
                <div className="text-sm text-gray-600">Total Signs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700">
                  ${Math.round((romPricing?.breakdownJson as any)?.avgPrice || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Avg. per Sign</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">-8.2%</div>
                <div className="text-sm text-gray-600">vs. Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Code Compliance Summary</h2>
              <span className="text-sm text-gray-600">{codeSummary?.jurisdiction}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Elements</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {(codeSummary?.requiredJson as string[])?.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Restrictions</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {(codeSummary?.restrictionsJson as string[])?.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Allowances</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {(codeSummary?.allowancesJson as string[])?.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Packages and Suggested Signage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested Exterior Signage</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs">M</span>
                    </div>
                    <span className="font-medium">Monument Sign</span>
                  </div>
                  <span className="text-sm text-gray-600">Required</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs">P</span>
                    </div>
                    <span className="font-medium">Parking Directional</span>
                  </div>
                  <span className="text-sm text-gray-600">Recommended</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs">W</span>
                    </div>
                    <span className="font-medium">Wayfinding System</span>
                  </div>
                  <span className="text-sm text-gray-600">Optional</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Example Packages</h2>
              <div className="space-y-4">
                {examplePackages?.map((pkg: any, index: number) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-lg p-4 ${
                      index === 1 ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                      <span className="text-lg font-bold text-primary-600">
                        ${pkg.priceMin?.toLocaleString()} - ${pkg.priceMax?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pkg.templateJson?.description}</p>
                    {index === 1 && (
                      <Badge className="mt-2 bg-primary-100 text-primary-800">Recommended</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Upload className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium">Upload Drawings</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Plus className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium">Add Sign Type</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Eye className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium">Review Proof</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Send className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium">Send RFQ</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
