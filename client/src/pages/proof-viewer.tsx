import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Download, Send, MapPin } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layout/main-layout";
import { formatDistanceToNow } from "date-fns";

interface ProofViewerProps {
  projectId: string;
}

export default function ProofViewer({ projectId }: ProofViewerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [isAddPinMode, setIsAddPinMode] = useState(false);
  const [selectedSign, setSelectedSign] = useState<any>(null);
  const [newComment, setNewComment] = useState("");

  const { data: proof, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/proof`],
  });

  const { data: pinnedComments } = useQuery({
    queryKey: ["/api/comments", { entity_type: "proof", entity_id: proof?.id }],
    enabled: !!proof?.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const res = await apiRequest("POST", "/api/comments", commentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/comments", { entity_type: "proof", entity_id: proof?.id }] 
      });
      setNewComment("");
      setIsAddPinMode(false);
      toast({
        title: "Comment added",
        description: "Your pinned comment has been added successfully.",
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isAddPinMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (newComment.trim()) {
      addCommentMutation.mutate({
        entityType: "proof",
        entityId: proof?.id,
        body: newComment,
        pinnedX: x,
        pinnedY: y,
      });
    } else {
      toast({
        title: "Please add a comment",
        description: "Enter a comment before placing a pin.",
        variant: "destructive",
      });
    }
  };

  const handleSignClick = (sign: any) => {
    setSelectedSign(sign);
  };

  const handlePinClick = (comment: any) => {
    // Scroll pin into view and highlight
    const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      commentElement.classList.add('ring-2', 'ring-yellow-400');
      setTimeout(() => {
        commentElement.classList.remove('ring-2', 'ring-yellow-400');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <MainLayout projectId={projectId}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout projectId={projectId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Digital Proof Viewer</h1>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Send className="h-4 w-4 mr-2" />
              Send for Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Proof Canvas */}
          <div className="col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Proof Layout</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isAddPinMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAddPinMode(!isAddPinMode)}
                      className={isAddPinMode ? "bg-primary-500 hover:bg-primary-600" : ""}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Add Pin
                    </Button>
                    <Select defaultValue="100">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% Zoom</SelectItem>
                        <SelectItem value="75">75% Zoom</SelectItem>
                        <SelectItem value="50">50% Zoom</SelectItem>
                        <SelectItem value="fit">Fit to Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isAddPinMode && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment, then click on the image to place a pin..."
                      rows={2}
                    />
                  </div>
                )}

                <div
                  ref={canvasRef}
                  className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                    isAddPinMode ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  style={{
                    height: '600px',
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={handleCanvasClick}
                >
                  {/* Sign Overlays */}
                  {proof?.items?.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className="absolute bg-white bg-opacity-90 border-2 border-primary-500 rounded flex items-center justify-center cursor-pointer hover:bg-opacity-100 transition-all text-xs font-medium text-gray-700"
                      style={{
                        left: `${(item.x || 0.1 + (index % 3) * 0.3) * 100}%`,
                        top: `${(item.y || 0.2 + Math.floor(index / 3) * 0.4) * 100}%`,
                        width: `${(item.w || 0.2) * 100}%`,
                        height: `${(item.h || 0.15) * 100}%`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSignClick(item.sign);
                      }}
                    >
                      {item.sign?.locationRef?.split(' - ')[0] || `Sign ${index + 1}`}
                    </div>
                  ))}

                  {/* Comment Pins */}
                  {pinnedComments?.map((comment: any, index: number) => (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-white text-xs font-bold"
                      style={{
                        left: `${(comment.pinnedX || 0.3 + index * 0.2) * 100}%`,
                        top: `${(comment.pinnedY || 0.4 + index * 0.1) * 100}%`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinClick(comment);
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sign Details Panel */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Sign</h3>
                {selectedSign ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{selectedSign.locationRef}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>ADA Room ID</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{selectedSign.width}" × {selectedSign.height}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {selectedSign.status?.replace('_', ' ') || 'In Review'}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-primary-500 hover:bg-primary-600">
                      View Full Details
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Click a sign to view details</p>
                )}
              </CardContent>
            </Card>

            {/* Pinned Comments */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pinned Comments</h3>
                <div className="space-y-3">
                  {pinnedComments?.map((comment: any, index: number) => (
                    <div
                      key={comment.id}
                      data-comment-id={comment.id}
                      className="border-l-4 border-red-500 pl-3 cursor-pointer hover:bg-gray-50 rounded-r p-2 transition-colors"
                      onClick={() => handlePinClick(comment)}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          {index + 1}
                        </span>
                        <span className="text-xs font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{comment.body}</p>
                    </div>
                  ))}
                  {(!pinnedComments || pinnedComments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No pinned comments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Proof Settings */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Proof Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
                    <Select defaultValue={proof?.currentVersion || "v1.0"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1.0">v1.0 (Current)</SelectItem>
                        <SelectItem value="v0.9">v0.9</SelectItem>
                        <SelectItem value="v0.8">v0.8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <Select defaultValue={proof?.status || "in_review"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-primary-500 hover:bg-primary-600">
                    Update Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
