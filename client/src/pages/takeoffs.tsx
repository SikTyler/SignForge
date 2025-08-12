import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, FileImage, Target, Grid, List, Download, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MasterSignType {
  id: string;
  name: string;
  category: string;
  defaultSpecsJson: any;
  createdAt: string;
}

interface ProjectSignType {
  id: string;
  projectId: string;
  masterSignTypeId?: string;
  name: string;
  category: string;
  specsJson: any;
  unitPrice?: number;
  notes?: string;
  createdAt: string;
}

interface DrawingSet {
  id: string;
  projectId: string;
  name: string;
  filePath: string;
  totalPages: number;
  includedPages?: number[];
  notes?: string;
  createdAt: string;
}

interface TakeoffMarker {
  id: string;
  projectId: string;
  drawingSetId: string;
  pageNumber: number;
  projectSignTypeId: string;
  x: number;
  y: number;
  notes?: string;
  createdAt: string;
}

const drawingUploadSchema = z.object({
  name: z.string().min(1, "Drawing name is required"),
  file: z.instanceof(File),
  notes: z.string().optional()
});

const signTypeSchema = z.object({
  name: z.string().min(1, "Sign type name is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Unit price must be positive").optional(),
  notes: z.string().optional(),
  specsJson: z.record(z.any()).optional()
});

type DrawingUploadForm = z.infer<typeof drawingUploadSchema>;
type SignTypeForm = z.infer<typeof signTypeSchema>;

interface TakeoffsPageProps {
  projectId: string;
}

export default function TakeoffsPage({ projectId }: TakeoffsPageProps) {
  // Project ID is passed as prop
  
  const [isDrawingUploadOpen, setIsDrawingUploadOpen] = useState(false);
  const [isSignTypeCreateOpen, setIsSignTypeCreateOpen] = useState(false);
  const [isMasterSignTypesOpen, setIsMasterSignTypesOpen] = useState(false);
  const [selectedMasterTypes, setSelectedMasterTypes] = useState<string[]>([]);
  const [selectedDrawingSet, setSelectedDrawingSet] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [markersMode, setMarkersMode] = useState(false);
  
  const { toast } = useToast();

  // Queries
  const { data: takeoffsData, isLoading: isTakeoffsLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "takeoffs"],
    enabled: !!projectId,
  });

  const { data: masterSignTypes = [], isLoading: isMasterTypesLoading } = useQuery<MasterSignType[]>({
    queryKey: ["/api/master-sign-types"],
  });

  // Forms
  const drawingForm = useForm<DrawingUploadForm>({
    resolver: zodResolver(drawingUploadSchema),
    defaultValues: {
      name: "",
      notes: ""
    }
  });

  const signTypeForm = useForm<SignTypeForm>({
    resolver: zodResolver(signTypeSchema),
    defaultValues: {
      name: "",
      category: "",
      notes: "",
      specsJson: {}
    }
  });

  // Mutations
  const uploadDrawingMutation = useMutation({
    mutationFn: async (data: DrawingUploadForm) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("file", data.file);
      if (data.notes) formData.append("notes", data.notes);

      const response = await fetch(`/api/projects/${projectId}/drawings`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload drawing');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "takeoffs"] });
      setIsDrawingUploadOpen(false);
      drawingForm.reset();
      toast({
        title: "Success",
        description: "Drawing uploaded successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload drawing",
        variant: "destructive"
      });
    }
  });

  const createSignTypeMutation = useMutation({
    mutationFn: async (data: SignTypeForm) => {
      const response = await fetch(`/api/projects/${projectId}/sign-types-takeoff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          unitPrice: data.unitPrice,
          notes: data.notes,
          specsJson: data.specsJson || {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sign type');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "takeoffs"] });
      setIsSignTypeCreateOpen(false);
      signTypeForm.reset();
      toast({
        title: "Success",
        description: "Sign type created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sign type",
        variant: "destructive"
      });
    }
  });

  const copyMasterTypesMutation = useMutation({
    mutationFn: async (masterIds: string[]) => {
      const response = await fetch(`/api/projects/${projectId}/copy-master-sign-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ masterIds })
      });

      if (!response.ok) {
        throw new Error('Failed to copy master sign types');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "takeoffs"] });
      setIsMasterSignTypesOpen(false);
      setSelectedMasterTypes([]);
      toast({
        title: "Success",
        description: "Master sign types copied successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to copy master sign types",
        variant: "destructive"
      });
    }
  });

  const onDrawingUpload = (data: DrawingUploadForm) => {
    uploadDrawingMutation.mutate(data);
  };

  const onSignTypeCreate = (data: SignTypeForm) => {
    createSignTypeMutation.mutate(data);
  };

  const handleCopyMasterTypes = () => {
    if (selectedMasterTypes.length > 0) {
      copyMasterTypesMutation.mutate(selectedMasterTypes);
    }
  };

  const handleMasterTypeSelection = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedMasterTypes(prev => [...prev, typeId]);
    } else {
      setSelectedMasterTypes(prev => prev.filter(id => id !== typeId));
    }
  };

  if (isTakeoffsLoading) {
    return <div className="p-6">Loading takeoffs data...</div>;
  }

  const drawingSets = (takeoffsData as any)?.drawingSets || [];
  const projectSignTypes = (takeoffsData as any)?.projectSignTypes || [];
  const markers = (takeoffsData as any)?.markers || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project Takeoffs</h1>
          <div className="flex space-x-2">
            <Dialog open={isDrawingUploadOpen} onOpenChange={setIsDrawingUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Drawing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Drawing Set</DialogTitle>
                </DialogHeader>
                <Form {...drawingForm}>
                  <form onSubmit={drawingForm.handleSubmit(onDrawingUpload)} className="space-y-4">
                    <FormField
                      control={drawingForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drawing Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter drawing name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={drawingForm.control}
                      name="file"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>PDF File</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(file);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={drawingForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter notes about this drawing set" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDrawingUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploadDrawingMutation.isPending}>
                        {uploadDrawingMutation.isPending ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isMasterSignTypesOpen} onOpenChange={setIsMasterSignTypesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy from Master
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Copy Master Sign Types</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  {isMasterTypesLoading ? (
                    <div>Loading master sign types...</div>
                  ) : (
                    <div className="space-y-2">
                      {masterSignTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2 p-2 border rounded">
                          <Checkbox
                            checked={selectedMasterTypes.includes(type.id)}
                            onCheckedChange={(checked) => handleMasterTypeSelection(type.id, checked === true)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-gray-500">{type.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsMasterSignTypesOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCopyMasterTypes} 
                    disabled={selectedMasterTypes.length === 0 || copyMasterTypesMutation.isPending}
                  >
                    {copyMasterTypesMutation.isPending ? "Copying..." : `Copy ${selectedMasterTypes.length} Types`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSignTypeCreateOpen} onOpenChange={setIsSignTypeCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sign Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Sign Type</DialogTitle>
                </DialogHeader>
                <Form {...signTypeForm}>
                  <form onSubmit={signTypeForm.handleSubmit(onSignTypeCreate)} className="space-y-4">
                    <FormField
                      control={signTypeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sign Type Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter sign type name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signTypeForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Interior, Exterior, Safety" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signTypeForm.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signTypeForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter notes about this sign type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsSignTypeCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createSignTypeMutation.isPending}>
                        {createSignTypeMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="drawings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drawings">Drawing Sets</TabsTrigger>
            <TabsTrigger value="sign-types">Sign Types</TabsTrigger>
            <TabsTrigger value="takeoffs">Takeoff Markers</TabsTrigger>
          </TabsList>

          <TabsContent value="drawings" className="space-y-4">
            {drawingSets.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No drawings uploaded</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Upload your first drawing set to start the takeoff process.</p>
                <Button onClick={() => setIsDrawingUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Drawing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawingSets.map((drawing: DrawingSet) => (
                  <Card key={drawing.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{drawing.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pages:</span>
                          <span className="font-medium">{drawing.totalPages}</span>
                        </div>
                        {drawing.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-gray-500">Notes:</span> {drawing.notes}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <Badge variant="outline">{drawing.includedPages?.length || 0} pages selected</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDrawingSet(drawing.id);
                              setSelectedPage(1);
                            }}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sign-types" className="space-y-4">
            {projectSignTypes.length === 0 ? (
              <div className="text-center py-12">
                <Grid className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sign types added</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Create sign types or copy from master list to start takeoffs.</p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => setIsMasterSignTypesOpen(true)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy from Master
                  </Button>
                  <Button onClick={() => setIsSignTypeCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sign Type
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectSignTypes.map((signType: ProjectSignType) => (
                  <Card key={signType.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{signType.name}</CardTitle>
                        <Badge variant="outline">{signType.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {signType.unitPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="font-medium">${signType.unitPrice}</span>
                          </div>
                        )}
                        {signType.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-gray-500">Notes:</span> {signType.notes}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-gray-500">Specifications:</span>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            {Object.entries(signType.specsJson || {}).slice(0, 3).map(([key, value]) => (
                              <div key={key}>{key}: {String(value)}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="takeoffs" className="space-y-4">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Takeoff Viewer</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Select a drawing set and sign types to begin placing takeoff markers.
              </p>
              <div className="text-sm text-gray-500">
                {markers.length} markers placed across {drawingSets.length} drawing sets
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}