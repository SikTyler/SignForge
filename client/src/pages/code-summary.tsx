import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Download, Edit, Trash2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CodeSummaryProps {
  projectId: string;
}

interface CodeSummary {
  id: string;
  projectId: string;
  jurisdiction: string;
  requiredJson: string[];
  allowancesJson: string[];
  restrictionsJson: string[];
  reviewer: string | null;
  createdAt: string;
}

export default function CodeSummary({ projectId }: CodeSummaryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<CodeSummary | null>(null);
  const [formData, setFormData] = useState({
    jurisdiction: "",
    required: [""],
    allowances: [""],
    restrictions: [""],
    reviewer: "",
  });

  const { data: codeSummary, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/code-summary`],
  });

  const createCodeSummaryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest(`/api/projects/${projectId}/code-summary`, {
        method: "POST",
        body: JSON.stringify({
          jurisdiction: data.jurisdiction,
          required: data.required.filter(item => item.trim() !== ""),
          allowances: data.allowances.filter(item => item.trim() !== ""),
          restrictions: data.restrictions.filter(item => item.trim() !== ""),
          reviewer: data.reviewer || null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/code-summary`] });
      setIsCreateDialogOpen(false);
      setFormData({
        jurisdiction: "",
        required: [""],
        allowances: [""],
        restrictions: [""],
        reviewer: "",
      });
      toast({
        title: "Code Summary Created",
        description: "Code summary has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create code summary.",
        variant: "destructive",
      });
    },
  });

  const updateCodeSummaryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest(`/api/projects/${projectId}/code-summary`, {
        method: "POST",
        body: JSON.stringify({
          jurisdiction: data.jurisdiction,
          required: data.required.filter(item => item.trim() !== ""),
          allowances: data.allowances.filter(item => item.trim() !== ""),
          restrictions: data.restrictions.filter(item => item.trim() !== ""),
          reviewer: data.reviewer || null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/code-summary`] });
      setIsEditDialogOpen(false);
      setEditingSummary(null);
      toast({
        title: "Code Summary Updated",
        description: "Code summary has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update code summary.",
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/code-summary.pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-summary-${codeSummary?.jurisdiction || 'local'}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF Exported",
          description: "Code summary has been exported successfully.",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export code summary.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (summary: CodeSummary) => {
    setEditingSummary(summary);
    setFormData({
      jurisdiction: summary.jurisdiction,
      required: summary.requiredJson.length > 0 ? summary.requiredJson : [""],
      allowances: summary.allowancesJson.length > 0 ? summary.allowancesJson : [""],
      restrictions: summary.restrictionsJson.length > 0 ? summary.restrictionsJson : [""],
      reviewer: summary.reviewer || "",
    });
    setIsEditDialogOpen(true);
  };

  const addItem = (field: 'required' | 'allowances' | 'restrictions') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const removeItem = (field: 'required' | 'allowances' | 'restrictions', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateItem = (field: 'required' | 'allowances' | 'restrictions', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  const handleSubmit = () => {
    if (!formData.jurisdiction.trim()) {
      toast({
        title: "Missing Jurisdiction",
        description: "Please enter a jurisdiction.",
        variant: "destructive",
      });
      return;
    }

    if (isEditDialogOpen) {
      updateCodeSummaryMutation.mutate(formData);
    } else {
      createCodeSummaryMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Code Summary</h1>
          <div className="flex gap-2">
            {codeSummary && (
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            )}
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {codeSummary ? "Update Summary" : "Create Summary"}
            </Button>
          </div>
        </div>

        {codeSummary ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Required Signage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Required Signage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {codeSummary.requiredJson.map((item, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Allowances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Allowances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {codeSummary.allowancesJson.map((item, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {codeSummary.restrictionsJson.map((item, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Info */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Jurisdiction</Label>
                    <p className="font-medium">{codeSummary.jurisdiction}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Reviewer</Label>
                    <p className="font-medium">{codeSummary.reviewer || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Last Updated</Label>
                    <p className="font-medium">
                      {new Date(codeSummary.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Code Summary</h3>
                <p className="text-gray-600 mb-4">
                  Create a code summary to document required, allowed, and restricted signage for this jurisdiction.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Code Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingSummary(null);
            setFormData({
              jurisdiction: "",
              required: [""],
              allowances: [""],
              restrictions: [""],
              reviewer: "",
            });
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditDialogOpen ? "Edit Code Summary" : "Create Code Summary"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="e.g., Seattle, WA"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewer">Reviewer</Label>
                  <Input
                    id="reviewer"
                    value={formData.reviewer}
                    onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                    placeholder="e.g., City Planning Department"
                  />
                </div>
              </div>

              {/* Required Signage */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-medium">Required Signage</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem('required')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.required.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={item}
                        onChange={(e) => updateItem('required', index, e.target.value)}
                        placeholder="e.g., ADA Room Identification - All rooms must have tactile and visual identification"
                        rows={2}
                        className="flex-1"
                      />
                      {formData.required.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('required', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Allowances */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-medium">Allowances</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem('allowances')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.allowances.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={item}
                        onChange={(e) => updateItem('allowances', index, e.target.value)}
                        placeholder="e.g., Illuminated signage permitted with automatic dimming after 10pm"
                        rows={2}
                        className="flex-1"
                      />
                      {formData.allowances.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('allowances', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-medium">Restrictions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem('restrictions')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.restrictions.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={item}
                        onChange={(e) => updateItem('restrictions', index, e.target.value)}
                        placeholder="e.g., Maximum sign height: 25 feet from ground level"
                        rows={2}
                        className="flex-1"
                      />
                      {formData.restrictions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('restrictions', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingSummary(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createCodeSummaryMutation.isPending || updateCodeSummaryMutation.isPending}
                >
                  {createCodeSummaryMutation.isPending || updateCodeSummaryMutation.isPending
                    ? "Saving..."
                    : isEditDialogOpen
                    ? "Update Summary"
                    : "Create Summary"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
