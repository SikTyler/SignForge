'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/page-header';
import { formatDate } from '@/lib/utils';
import { Download, Eye, CheckCircle, XCircle, History, Printer } from 'lucide-react';

export default function ProjectProofPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId, updateSign } = useSignsStore();

	const project = getProjectById(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);

	const [selectedSignType, setSelectedSignType] = useState<string | null>(null);
	const [showVersionHistory, setShowVersionHistory] = useState(false);

	if (!project) {
		return (<div className="flex items-center justify-center h-64"><div className="text-center"><h2 className="text-2xl font-bold">Project not found</h2><p className="text-muted-foreground">The project you're looking for doesn't exist.</p></div></div>);
	}

	const signsByType = signs.reduce((acc, sign) => { (acc[sign.signTypeId] ||= []).push(sign); return acc; }, {} as Record<string, typeof signs>);
	const handleApproveSign = (id: string) => updateSign(id, { reviewStatus: 'approved' });
	const handleRejectSign = (id: string) => updateSign(id, { reviewStatus: 'changes_requested' });
	const handleExportPDF = () => alert('PDF export functionality coming soon');
	const handlePrint = () => window.print();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Design Proof"
				subtitle="Review and approve sign artwork"
				actions={(
					<div className="flex items-center space-x-2">
						<Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" />Export PDF</Button>
						<Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print 11×17</Button>
					</div>
				)}
			/>

			<Card className="sg-card">
				<CardHeader className="sg-card-header">
					<CardTitle>Select Sign Type</CardTitle>
					<CardDescription>Choose a sign type to review its proof</CardDescription>
				</CardHeader>
				<CardContent className="sg-card-content">
					<Select value={selectedSignType || ''} onValueChange={setSelectedSignType}>
						<SelectTrigger className="w-96 h-9"><SelectValue placeholder="Select a sign type to review" /></SelectTrigger>
						<SelectContent>
							{signTypes.map((signType) => (
								<SelectItem key={signType.id} value={signType.id}>{signType.code} - {signType.name} ({signsByType[signType.id]?.length || 0} signs)</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{selectedSignType && (
				<div className="space-y-6">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Specification PDF</CardTitle><CardDescription>Technical specifications and requirements</CardDescription></CardHeader>
						<CardContent className="sg-card-content">
							<div className="w-full h-64 bg-gray-100 border rounded-2xl flex items-center justify-center">
								<div className="text-center"><div className="text-4xl mb-4">📄</div><p className="text-muted-foreground">Spec PDF Preview</p><p className="text-sm text-muted-foreground">Technical specifications for {signTypes.find(st => st.id === selectedSignType)?.name}</p></div>
							</div>
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header">
							<div className="flex items-center justify-between w-full">
								<div>
									<CardTitle>Artwork Grid</CardTitle>
									<CardDescription>Review individual sign artwork (optimized for 11×17 printing)</CardDescription>
								</div>
								<div className="flex items-center space-x-2">
									<Button variant="outline" size="sm" onClick={() => setShowVersionHistory(!showVersionHistory)}><History className="mr-2 h-4 w-4" />Version History</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="sg-card-content">
							<div className="grid grid-cols-6 gap-4 proof-grid">
								{signsByType[selectedSignType]?.map((sign) => (
									<div key={sign.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer artwork-tile" onClick={() => console.log('Open sign details for:', sign.id)}>
										<div className="w-full h-32 bg-gray-100 border rounded mb-3 flex items-center justify-center"><div className="text-center"><div className="text-2xl mb-2">🎨</div><p className="text-xs text-muted-foreground">Artwork</p></div></div>
										<div className="space-y-2">
											<div className="text-sm font-medium">Sign {sign.id}</div>
											<div className="text-xs text-muted-foreground">{sign.drawingId ? `Drawing: ${sign.drawingId}` : 'No location'}</div>
											<div className="flex items-center space-x-1">
												<Badge
													variant={sign.reviewStatus === 'approved' ? 'default' : sign.reviewStatus === 'changes_requested' ? 'destructive' : sign.reviewStatus === 'in_review' ? 'secondary' : 'outline'}
													className="text-xs"
												>
													{sign.reviewStatus.replace('_', ' ')}
												</Badge>
											</div>
											<div className="flex items-center space-x-1 mt-2">
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleApproveSign(sign.id); }}><CheckCircle className="h-3 w-3 text-green-600" /></Button>
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleRejectSign(sign.id); }}><XCircle className="h-3 w-3 text-red-600" /></Button>
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); }}><Eye className="h-3 w-3" /></Button>
											</div>
										</div>
									</div>
								))}
							</div>
							{(!signsByType[selectedSignType] || signsByType[selectedSignType].length === 0) && (
								<div className="text-center py-8 text-muted-foreground">No signs found for this type</div>
							)}
						</CardContent>
					</Card>

					{showVersionHistory && (
						<Card className="sg-card">
							<CardHeader className="sg-card-header"><CardTitle>Version History</CardTitle><CardDescription>Previous versions of artwork</CardDescription></CardHeader>
							<CardContent className="sg-card-content">
								<div className="space-y-4">
									{signsByType[selectedSignType]?.map((sign) => (
										<div key={sign.id} className="border rounded-lg p-4">
											<div className="flex items-center justify-between mb-2"><h4 className="font-medium">Sign {sign.id}</h4><span className="text-sm text-muted-foreground">{formatDate(new Date())}</span></div>
											<div className="grid grid-cols-4 gap-2">
												{sign.versionHistory?.map((version, index) => (
													<div key={index} className="border rounded p-2"><div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center"><span className="text-xs">v{index + 1}</span></div><div className="text-xs text-muted-foreground">{formatDate(version.updatedAt)}</div></div>
												)) || (<div className="text-sm text-muted-foreground">No version history available</div>)}
											</div>
										</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{!selectedSignType && (
				<Card className="sg-card">
					<CardContent className="sg-card-content text-center py-12">
						<div className="text-4xl mb-4">🎨</div>
						<h3 className="text-lg font-medium mb-2">Select a Sign Type</h3>
						<p className="text-muted-foreground">Choose a sign type from the dropdown above to review its proof</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
