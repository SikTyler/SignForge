import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ActivityLog from "@/components/common/activity-log";
import { formatDistanceToNow } from "date-fns";

interface SignDetailProps {
  signId: string;
}

export default function SignDetail({ signId }: SignDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: signData, isLoading } = useQuery({
    queryKey: [`/api/signs/${signId}`],
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/comments", { entity_type: "sign", entity_id: signId }],
    enabled: !!signId,
  });

  const updateSignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/signs/${signId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/signs/${signId}`] });
      setIsEditing(false);
      toast({
        title: "Sign updated",
        description: "Sign specifications have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const res = await apiRequest("POST", "/api/comments", commentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/comments", { entity_type: "sign", entity_id: signId }] 
      });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!signData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Sign not found</h1>
          <Button onClick={() => setLocation(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveChanges = () => {
    updateSignMutation.mutate(editData);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      entityType: "sign",
      entityId: signId,
      body: newComment,
    });
  };

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

  const isStale = signData.tileArtwork?.paramsJson?.stale;
  const extendedPrice = (editData.unitPrice || signData.unitPrice) * (editData.qty || signData.qty);

  const mockHistory = [
    {
      id: "1",
      description: "Sarah updated specifications",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2", 
      description: "Mike uploaded new artwork",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "3",
      description: "Sign created",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{signData.locationRef}</h1>
            <p className="text-gray-600">{signData.signType?.name || 'Sign'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artwork Preview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Tile Artwork</h2>
                  <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Update Artwork
                  </Button>
                </div>

                {isStale && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-yellow-800 font-medium">Spec Changed - Regenerate Required</p>
                        <p className="text-yellow-700 text-sm">The sign type specification was updated. Please regenerate this artwork.</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Professional sign mockup preview" 
                    className="mx-auto rounded-lg shadow-md max-w-md"
                  />
                  <p className="text-gray-600 mt-4">Current Artwork Preview</p>
                </div>
              </CardContent>
            </Card>

            {/* Sign Specifications */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(true);
                        setEditData({
                          width: signData.width,
                          height: signData.height,
                          qty: signData.qty,
                          unitPrice: signData.unitPrice,
                          status: signData.status,
                        });
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={isEditing ? editData.width : signData.width}
                      onChange={(e) => setEditData({...editData, width: parseFloat(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={isEditing ? editData.height : signData.height}
                      onChange={(e) => setEditData({...editData, height: parseFloat(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qty">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={isEditing ? editData.qty : signData.qty}
                      onChange={(e) => setEditData({...editData, qty: parseInt(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={isEditing ? editData.unitPrice : signData.unitPrice}
                      onChange={(e) => setEditData({...editData, unitPrice: parseFloat(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={isEditing ? editData.status : signData.status}
                      onValueChange={(value) => setEditData({...editData, status: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="in_production">In Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="extendedPrice">Extended Price</Label>
                    <Input
                      id="extendedPrice"
                      value={`$${extendedPrice.toLocaleString()}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 flex space-x-3">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={updateSignMutation.isPending}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      {updateSignMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Comments Panel */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>

                {/* Add Comment */}
                <div className="mb-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="mt-2 bg-primary-500 hover:bg-primary-600"
                    size="sm"
                  >
                    {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments?.map((comment: any) => (
                    <div key={comment.id} className="border-l-4 border-primary-200 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.body}</p>
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Panel */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">History</h3>
                <ActivityLog activities={mockHistory} />
              </CardContent>
            </Card>

            {/* Sign Status */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
                <Badge className={`${getStatusColor(signData.status)} border-0 text-sm px-3 py-1`}>
                  {signData.status.replace('_', ' ')}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Last updated {formatDistanceToNow(new Date(signData.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
