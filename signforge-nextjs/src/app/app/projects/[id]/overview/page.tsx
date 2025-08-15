'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { formatCurrency, formatPercentage, formatDate, formatDateTime } from '@/lib/utils';
import { seedVendors } from '@/lib/data/seed';
import { MapPin, Building2, DollarSign, CheckCircle, AlertCircle, Download, FileText, Upload, Settings } from 'lucide-react';

export default function ProjectOverviewPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId } = useSignsStore();

	const project = getProjectById(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);
	const [notes, setNotes] = useState(project?.notes || '');
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	if (!project) {
		return (<div className="flex items-center justify-center h-64"><div className="text-center"><h2 className="text-2xl font-bold">Project not found</h2><p className="text-muted-foreground">The project you're looking for doesn't exist.</p></div></div>);
	}

	// Auto-save notes functionality
	useEffect(() => {
		if (notes !== (project?.notes || '')) {
			setIsSaving(true);
			const timer = setTimeout(() => {
				// TODO: Save notes to store
				setLastSaved(new Date());
				setIsSaving(false);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [notes, project?.notes]);

	const handleNotesChange = (value: string) => {
		setNotes(value);
	};

	// Metrics calculations
	const totalSigns = signs.length;
	const installedSigns = signs.filter(s => s.stage === 'complete').length;
	const installationProgress = totalSigns > 0 ? (installedSigns / totalSigns) * 100 : 0;
	
	// Estimate calculations
	const subtotal = project.estimate.subtotal;
	const taxRate = project.estimate.taxRate;
	const taxAmount = subtotal * (taxRate / 100);
	const total = subtotal + taxAmount;

	// Activity feed (latest 10)
	const activityFeed = [
		{ id: '1', type: 'upload', description: 'Uploaded new drawing: Ground Floor Plan', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: 'John Doe' },
		{ id: '2', type: 'placement', description: 'Placed 5 signs on drawing GF-01', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), user: 'Jane Smith' },
		{ id: '3', type: 'approval', description: 'Approved 3 signs for production', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), user: 'Mike Johnson' },
		{ id: '4', type: 'status_change', description: 'Changed project status to Active', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), user: 'Sarah Wilson' },
		{ id: '5', type: 'drawing', description: 'Updated drawing specs for Level 2', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), user: 'Alice Brown' },
		{ id: '6', type: 'vendor', description: 'Assigned production vendor', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), user: 'Bob Chen' },
		{ id: '7', type: 'creation', description: 'Project created', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), user: 'Sarah Wilson' },
	].slice(0, 10);

	const iconFor: Record<string, any> = { 
		upload: Upload, 
		placement: MapPin, 
		approval: CheckCircle, 
		status_change: Settings,
		drawing: FileText,
		vendor: Building2,
		creation: Building2
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Overview">
				<Button variant="outline" size="sm">
					<Download className="mr-2 h-4 w-4" />
					Export Snapshot
				</Button>
			</PageHeader>

			{/* Two-column layout */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left column: Metrics + Activity */}
				<div className="lg:col-span-2 space-y-6">
					{/* Metrics Card */}
					<Card className="sg-card">
						<CardHeader className="sg-card-header">
							<CardTitle>Project Metrics</CardTitle>
							<CardDescription>Summary of signs and project estimate</CardDescription>
						</CardHeader>
						<CardContent className="sg-card-content space-y-4">
							{/* Sign metrics */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">{signTypes.length}</div>
									<div className="text-sm text-muted-foreground">Sign Types</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">{totalSigns}</div>
									<div className="text-sm text-muted-foreground">Total Signs</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">{installedSigns}</div>
									<div className="text-sm text-muted-foreground">Installed</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">{formatPercentage(installationProgress / 100)}</div>
									<div className="text-sm text-muted-foreground">Installed %</div>
								</div>
							</div>
							
							{/* Estimate snapshot */}
							<div className="pt-4 border-t border-border">
								<h4 className="text-sm font-medium text-foreground mb-3">Estimate Snapshot</h4>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Subtotal</span>
										<span className="font-medium">{formatCurrency(subtotal)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tax ({formatPercentage(taxRate / 100)})</span>
										<span className="font-medium">{formatCurrency(taxAmount)}</span>
									</div>
									<div className="flex justify-between border-t border-border pt-2">
										<span className="font-medium">Total</span>
										<span className="font-bold">{formatCurrency(total)}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Activity Feed */}
					<Card className="sg-card">
						<CardHeader className="sg-card-header">
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>Latest 10 project updates</CardDescription>
						</CardHeader>
						<CardContent className="sg-card-content">
							{activityFeed.length === 0 ? (
								<div className="text-center py-8">
									<AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
									<p className="text-sm text-muted-foreground">No recent activity</p>
								</div>
							) : (
								<div className="space-y-3">
									{activityFeed.map((activity, index) => {
										const Icon = iconFor[activity.type] || AlertCircle;
										return (
											<div key={activity.id} className={`flex items-start space-x-3 ${index !== activityFeed.length - 1 ? 'pb-3 border-b border-border/50' : ''}`}>
												<div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-0.5">
													<Icon className="h-3 w-3 text-muted-foreground" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-foreground">{activity.description}</p>
													<div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
														<span>{activity.user}</span>
														<span>•</span>
														<span>{formatDateTime(activity.timestamp)}</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right column: Notes Panel */}
				<div>
					<Card className="sg-card">
						<CardHeader className="sg-card-header">
							<CardTitle>Notes</CardTitle>
							{lastSaved && (
								<CardDescription>
									Last edited {formatDateTime(lastSaved)}
								</CardDescription>
							)}
						</CardHeader>
						<CardContent className="sg-card-content">
							<Textarea
								placeholder="Add project notes..."
								value={notes}
								onChange={(e) => handleNotesChange(e.target.value)}
								className="min-h-[300px] resize-none"
							/>
							{isSaving && (
								<p className="text-xs text-muted-foreground mt-2">Saving...</p>
							)}
							{lastSaved && !isSaving && (
								<p className="text-xs text-muted-foreground mt-2">
									Saved {formatDateTime(lastSaved)}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
