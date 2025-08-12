import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Tag } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";
import EmptyState from "@/components/common/empty-state";
import { useState } from "react";

interface SignsProps {
  projectId: string;
}

export default function Signs({ projectId }: SignsProps) {
  const [selectedSignType, setSelectedSignType] = useState<string>("all");
  
  const { data: signs, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/signs`],
  });

  const { data: signTypes } = useQuery({
    queryKey: [`/api/projects/${projectId}/sign-types`],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_production':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSigns = signs?.filter((sign: any) => 
    selectedSignType === "all" || sign.signTypeId === selectedSignType
  ) || [];

  if (isLoading) {
    return (
      <MainLayout projectId={projectId}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  if (!signs || signs.length === 0) {
    return (
      <MainLayout projectId={projectId}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Signs</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sign
          </Button>
        </div>
        <EmptyState
          icon={Tag}
          title="No signs found"
          description="Get started by creating individual signs from your sign types."
          action={{
            label: "Add Sign",
            onClick: () => console.log("Add sign"),
          }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout projectId={projectId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Signs</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sign
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={selectedSignType} onValueChange={setSelectedSignType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by sign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sign Types</SelectItem>
              {signTypes?.map((signType: any) => (
                <SelectItem key={signType.id} value={signType.id}>
                  {signType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Sign Type</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Extended Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSigns.map((sign: any) => (
                  <TableRow key={sign.id}>
                    <TableCell className="font-medium">{sign.locationRef}</TableCell>
                    <TableCell>{sign.signTypeName}</TableCell>
                    <TableCell>{sign.width}" × {sign.height}"</TableCell>
                    <TableCell>{sign.qty}</TableCell>
                    <TableCell>${sign.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      ${(sign.unitPrice * sign.qty).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(sign.status)} border-0`}>
                        {sign.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/signs/${sign.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredSigns.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${filteredSigns.reduce((sum: number, sign: any) => sum + (sign.unitPrice * sign.qty), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total for {filteredSigns.length} signs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
