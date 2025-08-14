'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/common/page-header';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { seedVendors } from '@/lib/data/seed';
import { MapPin, Building2, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProjectOverviewPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId } = useSignsStore();

	const project = getProjectById(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);
	const [notes, setNotes] = useState(project?.notes || '');

	if (!project) {
		return (<div className="flex items-center justify-center h-64"><div className="text-center"><h2 className="text-2xl font-bold">Project not found</h2><p className="text-muted-foreground">The project you're looking for doesn't exist.</p></div></div>);
	}

	const totalSigns = signs.length;
	const installedSigns = signs.filter(s => s.stage === 'complete').length;
	const installationProgress = totalSigns > 0 ? (installedSigns / totalSigns) * 100 : 0;
	const pendingApprovals = signs.filter(s => s.reviewStatus === 'in_review').length;
	const approvedSigns = signs.filter(s => s.reviewStatus === 'approved').length;

	const productionVendor = seedVendors.find(v => v.id === project.vendors?.productionVendorId);
	const installVendor = seedVendors.find(v => v.id === project.vendors?.installVendorId);

	const activityFeed = [
		{ id: '1', type: 'upload', description: 'Uploaded new drawing: Ground Floor Plan', time: '2 hours ago', user: 'John Doe' },
		{ id: '2', type: 'placement', description: 'Placed 5 signs on drawing GF-01', time: '4 hours ago', user: 'Jane Smith' },
		{ id: '3', type: 'approval', description: 'Approved 3 signs for production', time: '1 day ago', user: 'Mike Johnson' },
		{ id: '4', type: 'status_change', description: 'Changed project status to Active', time: '2 days ago', user: 'Sarah Wilson' },
	];

	const iconFor: Record<string, any> = { upload: Building2, placement: MapPin, approval: CheckCircle, status_change: AlertCircle };

	return (
		<div className="space-y-6">
			<PageHeader title={project.name} subtitle={`${project.clientName} • ${project.location.city}, ${project.location.state}`} />

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Total Signs</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{totalSigns}</div><p className="text-xs text-muted-foreground">{signTypes.length} sign types</p></CardContent></Card>
						<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Installed</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{installedSigns}</div><p className="text-xs text-muted-foreground">{formatPercentage(installationProgress / 100)}</p></CardContent></Card>
						<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Pending Approval</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{pendingApprovals}</div><p className="text-xs text-muted-foreground">{approvedSigns} approved</p></CardContent></Card>
						<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Estimate</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{formatCurrency(project.estimate.total)}</div><p className="text-xs text-muted-foreground">{formatPercentage(project.estimate.taxRate)} tax</p></CardContent></Card>
					</div>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Installation Progress</CardTitle><CardDescription>{installedSigns} of {totalSigns} signs installed</CardDescription></CardHeader>
						<CardContent className="sg-card-content"><Progress value={installationProgress} className="w-full" /><div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>0%</span><span>100%</span></div></CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Recent Activity</CardTitle><CardDescription>Latest updates and changes</CardDescription></CardHeader>
						<CardContent className="sg-card-content"><div className="space-y-4">{activityFeed.map((a) => { const Icon = iconFor[a.type]; return (<div key={a.id} className="flex items-start space-x-3"><Icon className="h-4 w-4 text-muted-foreground mt-1" /><div className="flex-1"><p className="text-sm font-medium text-foreground">{a.description}</p><div className="flex items-center space-x-2 text-xs text-muted-foreground"><span>{a.user}</span><span>•</span><span>{a.time}</span></div></div></div>); })}</div></CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Project Details</CardTitle></CardHeader>
						<CardContent className="sg-card-content space-y-3">
							<div><label className="text-sm font-medium text-muted-foreground">Client</label><p className="text-sm">{project.clientName}</p></div>
							<div><label className="text-sm font-medium text-muted-foreground">Location</label><p className="text-sm">{project.location.address && `${project.location.address}, `}{project.location.city}, {project.location.state}</p></div>
							<div><label className="text-sm font-medium text-muted-foreground">Status</label><Badge className="mt-1">{project.status.replace('_', ' ')}</Badge></div>
							<div><label className="text-sm font-medium text-muted-foreground">Production Vendor</label><p className="text-sm">{productionVendor?.name || 'Not assigned'}</p></div>
							<div><label className="text-sm font-medium text-muted-foreground">Install Vendor</label><p className="text-sm">{installVendor?.name || 'Not assigned'}</p></div>
							<div><label className="text-sm font-medium text-muted-foreground">Last Updated</label><p className="text-sm">{formatDate(project.updatedAt)}</p></div>
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Notes</CardTitle><CardDescription>Project notes and comments</CardDescription></CardHeader>
						<CardContent className="sg-card-content"><Textarea placeholder="Add project notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[120px]" /></CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
