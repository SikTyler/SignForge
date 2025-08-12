import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calculator, DollarSign, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TakeoffsProps {
  projectId: string;
}

interface TakeoffLine {
  id?: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  notes?: string;
  signTypeId?: string;
  signItemId?: string;
}

interface RomEstimate {
  id: string;
  projectId: string;
  takeoffId: string;
  subtotal: number;
  tax: number;
  total: number;
  categoryBreakdownJson: Record<string, number>;
  examplesRef: string[];
  createdAt: string;
  examples?: ExamplePackage[];
}

interface ExamplePackage {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  templateJson: {
    description: string;
    includes: string[];
    typicalProjects: string;
  };
}

export default function Takeoffs({ projectId }: TakeoffsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateTakeoffOpen, setIsCreateTakeoffOpen] = useState(false);
  const [takeoffLines, setTakeoffLines] = useState<TakeoffLine[]>([]);
  const [newLine, setNewLine] = useState<TakeoffLine>({
    description: "",
    qty: 1,
    unit: "ea",
    unitPrice: 0,
    notes: "",
  });

  // Get sign types for dropdown
  const { data: signTypes } = useQuery({
    queryKey: [`/api/projects/${projectId}/sign-types`],
  });

  // Get ROM estimate
  const { data: romEstimate, isLoading: romLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/rom`],
  });

  // Get example packages
  const { data: examplePackages } = useQuery({
    queryKey: [`/api/projects/${projectId}/example-packages`],
  });

  const createTakeoffMutation = useMutation({
    mutationFn: async (lines: TakeoffLine[]) => {
      return apiRequest(`/api/projects/${projectId}/takeoffs`, {
        method: "POST",
        body: JSON.stringify({ lines }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/rom`] });
      setIsCreateTakeoffOpen(false);
      setTakeoffLines([]);
      toast({
        title: "Takeoff created",
        description: "Takeoff has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create takeoff.",
        variant: "destructive",
      });
    },
  });

  const generateRomMutation = useMutation({
    mutationFn: async (takeoffId: string) => {
      return apiRequest(`/api/projects/${projectId}/rom`, {
        method: "POST",
        body: JSON.stringify({ takeoffId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/rom`] });
      toast({
        title: "ROM Generated",
        description: "ROM estimate has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate ROM estimate.",
        variant: "destructive",
      });
    },
  });

  const addLine = () => {
    if (newLine.description && newLine.unitPrice > 0) {
      setTakeoffLines([...takeoffLines, { ...newLine }]);
      setNewLine({
        description: "",
        qty: 1,
        unit: "ea",
        unitPrice: 0,
        notes: "",
      });
    }
  };

  const removeLine = (index: number) => {
    setTakeoffLines(takeoffLines.filter((_, i) => i !== index));
  };

  const handleCreateTakeoff = () => {
    if (takeoffLines.length === 0) {
      toast({
        title: "No lines",
        description: "Please add at least one line item.",
        variant: "destructive",
      });
      return;
    }
    createTakeoffMutation.mutate(takeoffLines);
  };

  const handleGenerateRom = () => {
    if (romEstimate?.takeoffId) {
      generateRomMutation.mutate(romEstimate.takeoffId);
    }
  };

  const calculateSubtotal = () => {
    return takeoffLines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.085; // 8.5% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Takeoffs & ROM</h1>
          <Button onClick={() => setIsCreateTakeoffOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Takeoff
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ROM Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                ROM Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {romLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : romEstimate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Subtotal</Label>
                      <p className="text-2xl font-bold">${romEstimate.subtotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Tax (8.5%)</Label>
                      <p className="text-2xl font-bold">${romEstimate.tax.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-sm text-gray-600">Total</Label>
                    <p className="text-3xl font-bold text-green-600">${romEstimate.total.toLocaleString()}</p>
                  </div>

                  {/* Category Breakdown */}
                  {romEstimate.categoryBreakdownJson && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Category Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(romEstimate.categoryBreakdownJson).map(([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-sm">{category}</span>
                            <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Packages */}
                  {romEstimate.examples && romEstimate.examples.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Similar Projects
                      </h4>
                      <div className="space-y-3">
                        {romEstimate.examples.map((example) => (
                          <div key={example.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium">{example.name}</h5>
                              <Badge variant="outline">
                                ${example.priceMin.toLocaleString()} - ${example.priceMax.toLocaleString()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{example.templateJson.description}</p>
                            <p className="text-xs text-gray-500">{example.templateJson.typicalProjects}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerateRom} 
                    disabled={generateRomMutation.isPending}
                    className="w-full mt-4"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {generateRomMutation.isPending ? "Generating..." : "Regenerate ROM"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No ROM estimate available</p>
                  <p className="text-sm">Create a takeoff to generate an estimate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quick Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Subtotal</Label>
                    <p className="text-2xl font-bold">${subtotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Tax (8.5%)</Label>
                    <p className="text-2xl font-bold">${tax.toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-sm text-gray-600">Total</Label>
                  <p className="text-3xl font-bold text-green-600">${total.toLocaleString()}</p>
                </div>

                {/* Line Items Summary */}
                {takeoffLines.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Line Items ({takeoffLines.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {takeoffLines.map((line, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="truncate flex-1">{line.description}</span>
                          <span className="font-medium">${(line.qty * line.unitPrice).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Takeoff Dialog */}
        <Dialog open={isCreateTakeoffOpen} onOpenChange={setIsCreateTakeoffOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Takeoff</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Add Line Item */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-4">Add Line Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newLine.description}
                      onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                      placeholder="e.g., ADA Room ID - Lobby"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qty">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      min="1"
                      value={newLine.qty}
                      onChange={(e) => setNewLine({ ...newLine, qty: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newLine.unit} onValueChange={(value) => setNewLine({ ...newLine, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ea">Each</SelectItem>
                        <SelectItem value="sf">Square Foot</SelectItem>
                        <SelectItem value="lf">Linear Foot</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newLine.unitPrice}
                      onChange={(e) => setNewLine({ ...newLine, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newLine.notes}
                    onChange={(e) => setNewLine({ ...newLine, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                <Button onClick={addLine} className="mt-4" disabled={!newLine.description || newLine.unitPrice <= 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>

              {/* Line Items Table */}
              {takeoffLines.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Line Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {takeoffLines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{line.description}</div>
                              {line.notes && (
                                <div className="text-sm text-gray-500">{line.notes}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{line.qty}</TableCell>
                          <TableCell>{line.unit}</TableCell>
                          <TableCell>${line.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">
                            ${(line.qty * line.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Summary */}
              {takeoffLines.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal: ${subtotal.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Tax (8.5%): ${tax.toLocaleString()}</p>
                      <p className="text-lg font-bold">Total: ${total.toLocaleString()}</p>
                    </div>
                    <Button 
                      onClick={handleCreateTakeoff} 
                      disabled={createTakeoffMutation.isPending}
                    >
                      {createTakeoffMutation.isPending ? "Creating..." : "Create Takeoff"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
