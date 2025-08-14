'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { Upload, Eye, MapPin, Layers, Settings, Trash2 } from 'lucide-react';

export default function ProjectDrawingsPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById, getDrawingsByProjectId, addDrawing } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId } = useSignsStore();

	const project = getProjectById(projectId);
	const drawings = getDrawingsByProjectId(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);

	const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
	const [isAddPinMode, setIsAddPinMode] = useState(false);
	const [selectedSignType, setSelectedSignType] = useState<string>('');
	const [selectedStage, setSelectedStage] = useState<string>('takeoffs');
	const canvasRef = useRef<HTMLDivElement>(null);

	const stages = ['takeoffs', 'production', 'installation', 'complete'];

	if (!project) {
		return (
			<div className="flex items-center justify-center h-64"><div className="text-center"><h2 className="text-2xl font-bold">Project not found</h2><p className="text-muted-foreground">The project you're looking for doesn't exist.</p></div></div>
		);
	}

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files; if (!files) return;
		Array.from(files).forEach((file) => {
			if (file.size > 25 * 1024 * 1024) { alert('File size must be less than 25MB'); return; }
			const drawing = { id: `drawing-${Date.now()}`, projectId, name: file.name.replace('.pdf', ''), shortCode: `DWG-${Date.now()}`, fileUrl: URL.createObjectURL(file), pages: 1, scale: { units: 'imperial' as const, ratioText: '1in=20ft' }, version: 1 };
			addDrawing(drawing);
		});
	};

	const handleCanvasClick = (e: React.MouseEvent) => {
		if (!isAddPinMode || !canvasRef.current || !selectedSignType) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		console.log('Place sign at:', { x, y, signTypeId: selectedSignType, stage: selectedStage });
		setIsAddPinMode(false);
	};

	const getSignsForDrawing = (drawingId: string) => signs.filter(s => s.drawingId === drawingId);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Drawings"
				subtitle="Upload PDFs, manage layers, and place signs"
				actions={(
					<div className="flex items-center space-x-2">
						<Select value={selectedSignType} onValueChange={setSelectedSignType}>
							<SelectTrigger className="w-48 h-9"><SelectValue placeholder="Select sign type" /></SelectTrigger>
							<SelectContent>
								{signTypes.map((signType) => (<SelectItem key={signType.id} value={signType.id}>{signType.code} - {signType.name}</SelectItem>))}
							</SelectContent>
						</Select>
						<Select value={selectedStage} onValueChange={setSelectedStage}>
							<SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
							<SelectContent>
								{stages.map((stage) => (<SelectItem key={stage} value={stage}>{stage}</SelectItem>))}
							</SelectContent>
						</Select>
						<Button variant={isAddPinMode ? 'default' : 'outline'} onClick={() => setIsAddPinMode(!isAddPinMode)} disabled={!selectedSignType}><MapPin className="mr-2 h-4 w-4" />{isAddPinMode ? 'Cancel' : 'Place Sign'}</Button>
						<Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
					</div>
				)}
			/>

			<div className="grid grid-cols-12 gap-4">
				{/* Left sidebar */}
				<div className="col-span-3 space-y-4">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle className="flex items-center"><Upload className="mr-2 h-4 w-4" />Upload Drawings</CardTitle><CardDescription>Upload PDF drawings (max 25MB each)</CardDescription></CardHeader>
						<CardContent className="sg-card-content space-y-3">
							<div>
								<Label htmlFor="drawing-upload">Select PDF files</Label>
								<Input id="drawing-upload" type="file" multiple accept=".pdf" onChange={handleFileUpload} className="mt-1" />
							</div>
							<div>
								<Label htmlFor="short-code">Short Code</Label>
								<Input id="short-code" placeholder="e.g., GF-01" className="mt-1" />
							</div>
							<div>
								<Label htmlFor="scale">Scale</Label>
								<Select defaultValue="imperial"><SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="imperial">Imperial (1in=20ft)</SelectItem><SelectItem value="metric">Metric (1cm=5m)</SelectItem></SelectContent></Select>
							</div>
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Drawings</CardTitle><CardDescription>{drawings.length} drawing{drawings.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
						<CardContent className="sg-card-content space-y-2">
							{drawings.map((drawing) => (
								<div key={drawing.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedDrawing === drawing.id ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)_/_0.06)]' : 'hover:bg-muted'}`} onClick={() => setSelectedDrawing(drawing.id)}>
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium text-sm">{drawing.name}</h4>
											<p className="text-xs text-muted-foreground">{drawing.shortCode} • {drawing.pages} page{drawing.pages !== 1 ? 's' : ''}</p>
										</div>
										<div className="flex items-center space-x-1">
											<Badge variant="secondary" className="text-xs">v{drawing.version}</Badge>
											<Button variant="ghost" size="sm"><Eye className="h-3 w-3" /></Button>
										</div>
									</div>
									<div className="mt-2 text-xs text-muted-foreground">{getSignsForDrawing(drawing.id).length} signs placed</div>
								</div>
							))}
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle className="flex items-center"><Layers className="mr-2 h-4 w-4" />Layers</CardTitle></CardHeader>
						<CardContent className="sg-card-content space-y-3">
							<div className="flex items-center space-x-2"><input type="checkbox" id="show-drawings" defaultChecked /><Label htmlFor="show-drawings" className="text-sm">Drawings</Label></div>
							<div className="flex items-center space-x-2"><input type="checkbox" id="show-signs" defaultChecked /><Label htmlFor="show-signs" className="text-sm">Signs</Label></div>
							{stages.map((stage) => (<div key={stage} className="flex items-center space-x-2"><input type="checkbox" id={`show-${stage}`} defaultChecked /><Label htmlFor={`show-${stage}`} className="text-sm capitalize">{stage}</Label></div>))}
						</CardContent>
					</Card>
				</div>

				{/* Center canvas */}
				<div className="col-span-6">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Drawing Viewer</CardTitle></CardHeader>
						<CardContent className="p-0">
							<div ref={canvasRef} className={`relative w-full h-[640px] bg-gray-100 border rounded-2xl overflow-hidden ${isAddPinMode ? 'cursor-crosshair' : 'cursor-default'}`} onClick={handleCanvasClick}>
								{selectedDrawing ? (
									<div className="w-full h-full flex items-center justify-center">
										<div className="text-center">
											<div className="text-4xl mb-4">📄</div>
											<p className="text-muted-foreground">PDF Viewer Placeholder</p>
											<p className="text-sm text-muted-foreground">Click to place signs when in placement mode</p>
										</div>
									</div>
								) : (
									<div className="w-full h-full flex items-center justify-center"><div className="text-center"><div className="text-4xl mb-4">📋</div><p className="text-muted-foreground">Select a drawing to view</p></div></div>
								)}

								{/* Render placed signs */}
								{selectedDrawing && signs.filter(s => s.drawingId === selectedDrawing).map((sign) => (
									<div key={sign.id} className="absolute w-4 h-4 rounded-full border-2 border-white bg-[hsl(var(--accent))] shadow-sm hover:ring-2 hover:ring-[hsl(var(--accent))] hover:ring-offset-2 ring-offset-background transition-transform" style={{ left: `${(sign.xNorm || 0) * 100}%`, top: `${(sign.yNorm || 0) * 100}%` }} title={`Sign ${sign.id}`} />
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right details panel placeholder */}
				<div className="col-span-3">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Placed Signs</CardTitle><CardDescription>Signs placed on this drawing</CardDescription></CardHeader>
						<CardContent className="sg-card-content">
							<div className="space-y-2">
								{selectedDrawing && getSignsForDrawing(selectedDrawing).map((sign) => (
									<div key={sign.id} className="flex items-center justify-between p-2 border rounded-lg">
										<div>
											<p className="text-sm font-medium">Sign {sign.id}</p>
											<p className="text-xs text-muted-foreground">Stage: {sign.stage} • Status: {sign.reviewStatus}</p>
										</div>
										<Button variant="ghost" size="sm"><Trash2 className="h-3 w-3" /></Button>
									</div>
								))}
								{selectedDrawing && getSignsForDrawing(selectedDrawing).length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">No signs placed on this drawing yet</p>)}
								{!selectedDrawing && (<p className="text-sm text-muted-foreground text-center py-4">Select a drawing to view placed signs</p>)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
