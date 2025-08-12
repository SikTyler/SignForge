import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Star, MapPin, Wrench } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/main-layout";
import EmptyState from "@/components/common/empty-state";
import { formatDistanceToNow } from "date-fns";

interface VendorsProps {
  projectId: string;
}

export default function Vendors({ projectId }: VendorsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rfqs, isLoading: rfqsLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/rfqs`],
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const isLoading = rfqsLoading || vendorsLoading;

  if (isLoading) {
    return (
      <MainLayout projectId={projectId}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const mockBids = [
    {
      id: "1",
      vendorName: "ProSign Industries",
      amount: 245000,
      leadTime: "8 weeks",
    },
    {
      id: "2",
      vendorName: "Elite Signage Co.",
      amount: 268500,
      leadTime: "6 weeks",
    },
    {
      id: "3",
      vendorName: "Northwest Signs",
      amount: 285750,
      leadTime: "10 weeks",
    },
  ];

  return (
    <MainLayout projectId={projectId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vendors & RFQs</h1>
          <Button className="bg-primary-500 hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
        </div>

        {/* RFQ Management */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active RFQs</h2>

            {rfqs && rfqs.length > 0 ? (
              <div className="space-y-4">
                {rfqs.map((rfq: any) => (
                  <Card key={rfq.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {rfq.scopeJson?.title || "Exterior Signage Package"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {rfq.scopeJson?.description || "Monument sign, parking signs, and wayfinding elements"}
                          </p>
                        </div>
                        <Badge className={`${
                          rfq.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        } border-0`}>
                          {rfq.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-600">Due Date</span>
                          <p className="text-sm font-medium">
                            {new Date(rfq.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Bids Received</span>
                          <p className="text-sm font-medium">{rfq.bidCount || 0}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Lowest Bid</span>
                          <p className="text-sm font-medium text-green-600">
                            {rfq.lowestBid ? `$${rfq.lowestBid.toLocaleString()}` : 'No bids yet'}
                          </p>
                        </div>
                      </div>

                      {/* Bids Table */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Submitted Bids</h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Bid Amount</TableHead>
                                <TableHead>Lead Time</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockBids.map((bid) => (
                                <TableRow key={bid.id}>
                                  <TableCell className="font-medium">{bid.vendorName}</TableCell>
                                  <TableCell className="font-medium">${bid.amount.toLocaleString()}</TableCell>
                                  <TableCell>{bid.leadTime}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button variant="outline" size="sm">
                                        View Details
                                      </Button>
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                        Accept
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Plus}
                title="No RFQs created"
                description="Create your first RFQ to start collecting bids from vendors."
                action={{
                  label: "Create RFQ",
                  onClick: () => console.log("Create RFQ"),
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Vendor Directory */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Directory</h2>

            {vendors && vendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor: any) => (
                  <Card key={vendor.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{vendor.org}</h3>
                        <Badge className="bg-green-100 text-green-800 border-0">
                          Verified
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{vendor.regionsJson?.[0] || "Pacific Northwest"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {vendor.rating || 4.8}/5 ({vendor.reviewCount || 24} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Wrench className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {vendor.capabilitiesJson?.join(", ") || "Monument, ADA, Parking"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-primary-100 text-primary-700 hover:bg-primary-200"
                        >
                          Invite to Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Star}
                title="No vendors found"
                description="No vendors are currently available in the directory."
                action={{
                  label: "Add Vendor",
                  onClick: () => console.log("Add vendor"),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
