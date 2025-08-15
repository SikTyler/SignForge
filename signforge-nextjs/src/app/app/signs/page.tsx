'use client';

import { useState } from 'react';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import {
  Plus,
  Palette,
  Settings,
  Copy,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react';

export default function GlobalSignsPage() {
  const { signTypes, addSignType, updateSignType, deleteSignType } = useSignsStore();
  const [selectedCategory, setSelectedCategory] = useState<'signTypes' | 'colors' | 'presets'>('signTypes');

  // Mock universal sign types (not tied to specific projects)
  const universalSignTypes = signTypes.filter(st => !st.projectId);

  // Mock pin colors
  const pinColors = [
    { id: '1', name: 'Primary Blue', color: '#2E86AB', usage: 12 },
    { id: '2', name: 'Accent Red', color: '#A23B72', usage: 8 },
    { id: '3', name: 'Warning Orange', color: '#F18F01', usage: 5 },
    { id: '4', name: 'Success Green', color: '#C73E1D', usage: 15 },
    { id: '5', name: 'Neutral Gray', color: '#3B1F2B', usage: 3 },
  ];

  // Mock presets
  const presets = [
    {
      id: '1',
      name: 'ADA Compliance',
      description: 'Standard ADA room identification signs',
      signTypes: ['ADA-001', 'ADA-002', 'ADA-003'],
      usage: 8,
    },
    {
      id: '2',
      name: 'Wayfinding System',
      description: 'Complete wayfinding and directional signage',
      signTypes: ['WAY-001', 'WAY-002', 'DIR-001', 'DIR-002'],
      usage: 12,
    },
    {
      id: '3',
      name: 'Building Identification',
      description: 'Building and floor identification signs',
      signTypes: ['BUILD-001', 'BUILD-002', 'FLOOR-001'],
      usage: 5,
    },
  ];

  const handleAddSignType = () => {
    const newSignType = {
      id: `sign-type-${Date.now()}`,
      projectId: '', // Universal sign type
      code: `UNI-${Date.now()}`,
      name: 'New Universal Sign Type',
      size: { w: 12, h: 8, units: 'in' as const },
      materials: 'Standard materials',
      basePrice: 50.00,
      color: '#2E86AB',
    };
    addSignType(newSignType);
  };

  const handleAddColor = () => {
    // TODO: Implement color management
    alert('Color management coming soon');
  };

  const handleAddPreset = () => {
    // TODO: Implement preset management
    alert('Preset management coming soon');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Signs"
        subtitle="Manage universal sign types, pin colors, and presets"
      />

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedCategory === 'signTypes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory('signTypes')}
        >
          Sign Types
        </Button>
        <Button
          variant={selectedCategory === 'colors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory('colors')}
        >
          Pin Colors
        </Button>
        <Button
          variant={selectedCategory === 'presets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory('presets')}
        >
          Presets
        </Button>
      </div>

      {/* Sign Types */}
      {selectedCategory === 'signTypes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Universal Sign Types</h2>
            <Button onClick={handleAddSignType}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sign Type
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universalSignTypes.map((signType) => (
              <Card key={signType.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{signType.name}</CardTitle>
                      <CardDescription>{signType.code}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: signType.color }}
                    />
                    <span className="text-sm">{signType.materials}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <div>{signType.size.w}" × {signType.size.h}" {signType.size.units}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div>{formatCurrency(signType.basePrice)}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Add to Project
                  </Button>
                </CardContent>
              </Card>
            ))}

            {universalSignTypes.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium mb-2">No Universal Sign Types</h3>
                  <p className="text-muted-foreground mb-4">
                    Create universal sign types that can be used across all projects
                  </p>
                  <Button onClick={handleAddSignType}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Sign Type
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Pin Colors */}
      {selectedCategory === 'colors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pin Colors</h2>
            <Button onClick={handleAddColor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinColors.map((color) => (
              <Card key={color.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{color.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm font-mono">{color.color}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Used in {color.usage} projects
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Presets */}
      {selectedCategory === 'presets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sign Type Presets</h2>
            <Button onClick={handleAddPreset}>
              <Plus className="mr-2 h-4 w-4" />
              Add Preset
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <Card key={preset.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{preset.name}</CardTitle>
                      <CardDescription>{preset.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Included Sign Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {preset.signTypes.map((signType) => (
                        <Badge key={signType} variant="secondary" className="text-xs">
                          {signType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Used in {preset.usage} projects
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Apply to Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
