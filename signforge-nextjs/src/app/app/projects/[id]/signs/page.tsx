'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { Download, FileText, Filter, Group, MapPin, Eye, Edit } from 'lucide-react';

export default function ProjectSignsPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById, getDrawingsByProjectId } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId, updateSign } = useSignsStore();

	const project = getProjectById(projectId);
	const drawings = getDrawingsByProjectId(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);

	const [groupBy, setGroupBy] = useState<'none' | 'signType' | 'stage' | 'drawing'>('none');
	const [stageFilter, setStageFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');

	if (!project) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<h2 className="text-2xl font-bold">Project not found</h2>
					<p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
				</div>
			</div>
		);
	}

	const filteredSigns = useMemo(() => {
		let filtered = signs;
		if (stageFilter !== 'all') filtered = filtered.filter(sign => sign.stage === stageFilter);
		if (statusFilter !== 'all') filtered = filtered.filter(sign => sign.reviewStatus === statusFilter);
		return filtered;
	}, [signs, stageFilter, statusFilter]);

	const groupedSigns = useMemo(() => {
		if (groupBy === 'none') return { 'All Signs': filteredSigns } as Record<string, typeof filteredSigns>;
		const groups: Record<string, typeof filteredSigns> = {};
		filteredSigns.forEach(sign => {
			let key = '';
			switch (groupBy) {
				case 'signType':
					const signType = signTypes.find(st => st.id === sign.signTypeId);
					key = signType ? `${signType.code} - ${signType.name}` : 'Unknown Type';
					break;
				case 'stage':
					key = sign.stage; break;
				case 'drawing':
					const drawing = drawings.find(d => d.id === sign.drawingId);
					key = drawing ? drawing.shortCode : 'No Drawing';
			}
			if (!groups[key]) groups[key] = [];
			groups[key].push(sign);
		});
		return groups;
	}, [filteredSigns, groupBy, signTypes, drawings]);

	const handleStageChange = (signId: string, newStage: string) => updateSign(signId, { stage: newStage });
	const handleStatusChange = (signId: string, newStatus: string) => updateSign(signId, { reviewStatus: newStatus as any });

	const handleExportXLSX = () => alert('XLSX export functionality coming soon');
	const handleExportPDF = () => alert('PDF export functionality coming soon');

	const getSignTypeInfo = (signTypeId: string) => signTypes.find(st => st.id === signTypeId);
	const getDrawingInfo = (drawingId?: string) => drawings.find(d => d.id === drawingId);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Message Schedule"
				subtitle="Sign schedule and status management"
				actions={(
					<div className="flex items-center space-x-2">
						<Button variant="outline" onClick={handleExportXLSX}><Download className="mr-2 h-4 w-4" />Export XLSX</Button>
						<Button variant="outline" onClick={handleExportPDF}><FileText className="mr-2 h-4 w-4" />Export PDF</Button>
					</div>
				)}
			/>

			<Card className="sg-card">
				<CardHeader className="sg-card-header">
					<CardTitle className="flex items-center"><Filter className="mr-2 h-4 w-4" />Filters & Grouping</CardTitle>
				</CardHeader>
				<CardContent className="sg-card-content">
					<div className="grid gap-4 md:grid-cols-4">
						<div>
							<label className="text-sm font-medium">Group By</label>
							<Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
								<SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Grouping</SelectItem>
									<SelectItem value="signType">Sign Type</SelectItem>
									<SelectItem value="stage">Stage</SelectItem>
									<SelectItem value="drawing">Drawing</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="text-sm font-medium">Stage Filter</label>
							<Select value={stageFilter} onValueChange={setStageFilter}>
								<SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Stages</SelectItem>
									<SelectItem value="takeoffs">Takeoffs</SelectItem>
									<SelectItem value="production">Production</SelectItem>
									<SelectItem value="installation">Installation</SelectItem>
									<SelectItem value="complete">Complete</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="text-sm font-medium">Status Filter</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="in_review">In Review</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
									<SelectItem value="changes_requested">Changes Requested</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end text-sm text-muted-foreground">{filteredSigns.length} signs found</div>
					</div>
				</CardContent>
			</Card>

			<Card className="sg-card">
				<CardHeader className="sg-card-header">
					<CardTitle>Sign Schedule</CardTitle>
					<CardDescription>Manage sign status and stage progression</CardDescription>
				</CardHeader>
				<CardContent className="sg-card-content">
					<div className="space-y-6">
						{Object.entries(groupedSigns).map(([groupName, groupSigns]) => (
							<div key={groupName}>
								{groupBy !== 'none' && (
									<div className="flex items-center space-x-2 mb-4">
										<Group className="h-4 w-4 text-muted-foreground" />
										<h3 className="font-semibold">{groupName}</h3>
										<Badge variant="secondary">{groupSigns.length}</Badge>
									</div>
								)}
								<div className="overflow-x-auto rounded-xl border">
									<table className="sg-table">
										<thead>
											<tr>
												<th>Sign Code</th>
												<th>Location</th>
												<th>Type</th>
												<th>Materials</th>
												<th>Stage</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{groupSigns.map((sign) => {
												const signType = getSignTypeInfo(sign.signTypeId);
												const drawing = getDrawingInfo(sign.drawingId);
												return (
													<tr key={sign.id} className="sg-table-row">
														<td>
															<div className="font-medium">{signType?.code || 'Unknown'}</div>
															<div className="text-xs text-muted-foreground">ID: {sign.id}</div>
														</td>
														<td>
															{drawing ? (
																<div>
																	<div className="font-medium">{drawing.shortCode}</div>
																	<div className="text-xs text-muted-foreground">Page {sign.page || 1}</div>
																</div>
															) : (
															<span className="text-muted-foreground">No location</span>
															)}
														</td>
														<td>
															<div className="font-medium">{signType?.name || 'Unknown'}</div>
															<div className="text-xs text-muted-foreground">{signType?.size.w}" × {signType?.size.h}" {signType?.size.units}</div>
														</td>
														<td><span className="text-sm">{signType?.materials || 'N/A'}</span></td>
														<td>
															<Select value={sign.stage} onValueChange={(v) => handleStageChange(sign.id, v)}>
																<SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
																<SelectContent>
																	<SelectItem value="takeoffs">Takeoffs</SelectItem>
																	<SelectItem value="production">Production</SelectItem>
																	<SelectItem value="installation">Installation</SelectItem>
																	<SelectItem value="complete">Complete</SelectItem>
																</SelectContent>
															</Select>
														</td>
														<td>
															<Select value={sign.reviewStatus} onValueChange={(v) => handleStatusChange(sign.id, v)}>
																<SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
																<SelectContent>
																	<SelectItem value="pending">Pending</SelectItem>
																	<SelectItem value="in_review">In Review</SelectItem>
																	<SelectItem value="approved">Approved</SelectItem>
																	<SelectItem value="changes_requested">Changes Requested</SelectItem>
																</SelectContent>
															</Select>
														</td>
														<td>
															<div className="flex items-center space-x-1">
																<Button variant="ghost" size="sm"><Eye className="h-3 w-3" /></Button>
																<Button variant="ghost" size="sm"><Edit className="h-3 w-3" /></Button>
															</div>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							{filteredSigns.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									<MapPin className="h-12 w-12 mx-auto mb-2" />
									No signs found matching the current filters
								</div>
							)}
						</div>
				</CardContent>
			</Card>
		</div>
	);
}
