import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Eye, Edit, Plus, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layout/main-layout";
import EmptyState from "@/components/common/empty-state";
import { formatDistanceToNow } from "date-fns";

interface DrawingsProps {
  projectId: string;
}

interface DrawingSet {
  id: string;
  projectId: string;
  version: string;
  uploadedBy: string;
  notes: string | null;
  createdAt: string;
  fileCount: number;
  files: DrawingFile[];
}

interface DrawingFile {
  id: string;
  drawingSetId: string;
  storageUrl: string;
  originalFilename: string;
  displayName: string;
  scale: string | null;
  shortCode: string | null;
  pageCount: number | null;
  createdAt: string;
}

export default function Drawings({ projectId }: DrawingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingFile, setEditingFile] = useState<DrawingFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSetData, setNewSetData] = useState({
    version: "1.0",
    notes: ""
  });

  const { data: drawingSets, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/drawings`],
  });

  const createDrawingSetMutation = useMutation({
    mutationFn: async (data: { version: string; notes: string }) => {
      return apiRequest(`/api/projects/${projectId}/drawing-sets`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/drawings`] });
      setIsCreatingSet(false);
      setNewSetData({ version: "1.0", notes: "" });
      toast({
        title: "Drawing set created",
        description: `Version ${data.version} created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create drawing set.",
        variant: "destructive",
      });
    },
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async ({ drawingSetId, files }: { drawingSetId: string; files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      
      return apiRequest(`/api/drawing-sets/${drawingSetId}/files`, {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/drawings`] });
      setIsUploading(false);
      setIsUploadDialogOpen(false);
      toast({
        title: "Files uploaded",
        description: "PDF files uploaded successfully.",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, data }: { fileId: string; data: Partial<DrawingFile> }) => {
      return apiRequest(`/api/drawing-files/${fileId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/drawings`] });
      setEditingFile(null);
      toast({
        title: "File updated",
        description: "File metadata updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update file metadata.",
        variant: "destructive",
      });
    },
  });

  const handleCreateDrawingSet = () => {
    createDrawingSetMutation.mutate(newSetData);
  };

  const handleFileUpload = (drawingSetId: string) => {
    if (fileInputRef.current?.files) {
      setIsUploading(true);
      uploadFilesMutation.mutate({
        drawingSetId,
        files: fileInputRef.current.files,
      });
    }
  };

  const handleEditFile = (file: DrawingFile) => {
    setEditingFile(file);
  };

  const handleSaveFileEdit = () => {
    if (editingFile) {
      updateFileMutation.mutate({
        fileId: editingFile.id,
        data: {
          displayName: editingFile.displayName,
          scale: editingFile.scale,
          shortCode: editingFile.shortCode,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!drawingSets || drawingSets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Drawings</h1>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Drawings
            </Button>
          </div>
          <EmptyState
            icon={FileText}
            title="No drawing sets found"
            description="Upload your first set of PDF drawings to get started with takeoffs."
            action={{
              label: "Upload Drawings",
              onClick: () => setIsUploadDialogOpen(true),
            }}
          />
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Drawing Set</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={newSetData.version}
                  onChange={(e) => setNewSetData({ ...newSetData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newSetData.notes}
                  onChange={(e) => setNewSetData({ ...newSetData, notes: e.target.value })}
                  placeholder="Optional notes about this drawing set..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDrawingSet} disabled={isCreatingSet}>
                  {isCreatingSet ? "Creating..." : "Create Set"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Drawings</h1>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Drawings
          </Button>
        </div>

        <div className="space-y-6">
          {drawingSets.map((set: DrawingSet) => (
            <Card key={set.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Version {set.version}
                      <Badge variant="secondary">{set.fileCount} files</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploaded {formatDistanceToNow(new Date(set.createdAt), { addSuffix: true })} by {set.uploadedBy}
                    </p>
                    {set.notes && (
                      <p className="text-sm text-gray-600 mt-1">{set.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewSetData({ version: set.version, notes: set.notes || "" });
                      setIsUploadDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {set.files && set.files.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Scale</TableHead>
                        <TableHead>Short Code</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Original Filename</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {set.files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">{file.displayName}</TableCell>
                          <TableCell>{file.scale || "-"}</TableCell>
                          <TableCell>{file.shortCode || "-"}</TableCell>
                          <TableCell>{file.pageCount || "?"}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {file.originalFilename}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFile(file)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(file.storageUrl, "_blank")}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(file.storageUrl, "_blank")}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No files in this drawing set yet.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Drawing Set</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={newSetData.version}
                  onChange={(e) => setNewSetData({ ...newSetData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newSetData.notes}
                  onChange={(e) => setNewSetData({ ...newSetData, notes: e.target.value })}
                  placeholder="Optional notes about this drawing set..."
                />
              </div>
              <div>
                <Label htmlFor="files">PDF Files</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // Auto-create set and upload files
                      createDrawingSetMutation.mutate(newSetData, {
                        onSuccess: (data) => {
                          handleFileUpload(data.id);
                        },
                      });
                    }
                  }}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Select one or more PDF files to upload
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateDrawingSet} 
                  disabled={isCreatingSet || isUploading}
                >
                  {isCreatingSet ? "Creating..." : isUploading ? "Uploading..." : "Create Set"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit File Dialog */}
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit File Metadata</DialogTitle>
            </DialogHeader>
            {editingFile && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editingFile.displayName}
                    onChange={(e) => setEditingFile({ ...editingFile, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="scale">Scale</Label>
                  <Input
                    id="scale"
                    value={editingFile.scale || ""}
                    onChange={(e) => setEditingFile({ ...editingFile, scale: e.target.value })}
                    placeholder="e.g., 1/4&quot; = 1'-0&quot;"
                  />
                </div>
                <div>
                  <Label htmlFor="shortCode">Short Code</Label>
                  <Input
                    id="shortCode"
                    value={editingFile.shortCode || ""}
                    onChange={(e) => setEditingFile({ ...editingFile, shortCode: e.target.value })}
                    placeholder="e.g., A1.1, A1.2"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingFile(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFileEdit} disabled={updateFileMutation.isPending}>
                    {updateFileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
