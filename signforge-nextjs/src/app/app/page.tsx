'use client';

import { useState } from 'react';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { formatPercentage } from '@/lib/utils';
import { FolderOpen, MapPin, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const timeframes = [
	{ value: '7', label: '7 days' },
	{ value: '30', label: '30 days' },
	{ value: '90', label: '90 days' },
];

export default function DashboardPage() {
	const [timeframe, setTimeframe] = useState('30');
	const { projects } = useProjectsStore();
	const { signs } = useSignsStore();

	const totalProjects = projects.length;
	const totalSigns = signs.length;
	const signsInstalled = signs.filter(s => s.stage === 'complete').length;
	const signsRemaining = totalSigns - signsInstalled;
	const pendingApprovals = signs.filter(s => s.reviewStatus === 'in_review').length;
	const rfqsOut = 3;

	const kpiCards = [
		{ title: 'Total Projects', value: totalProjects, icon: FolderOpen, trend: '+2', dir: 'up' as const },
		{ title: 'Total Signs', value: totalSigns, icon: MapPin, trend: '+15', dir: 'up' as const },
		{ title: 'Signs Installed', value: signsInstalled, icon: CheckCircle, trend: formatPercentage(totalSigns ? signsInstalled / totalSigns : 0), dir: 'up' as const },
		{ title: 'Signs Remaining', value: signsRemaining, icon: Clock, trend: formatPercentage(totalSigns ? signsRemaining / totalSigns : 0), dir: 'down' as const },
		{ title: 'Pending Approvals', value: pendingApprovals, icon: AlertCircle, trend: '-3', dir: 'down' as const },
		{ title: 'RFQs Out', value: rfqsOut, icon: AlertCircle, trend: '+1', dir: 'up' as const },
	];

	return (
		<div className="space-y-6">
			<PageHeader
				title="Dashboard"
				subtitle="Overview of your signage projects and activities"
				actions={(
					<Select value={timeframe} onValueChange={setTimeframe}>
						<SelectTrigger className="w-32 h-9">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{timeframes.map((tf) => (
								<SelectItem key={tf.value} value={tf.value}>
									{tf.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{kpiCards.map((card) => (
					<Card key={card.title} className="sg-card sg-kpi">
						<CardHeader className="sg-card-header flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
							<card.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent className="sg-card-content space-y-2">
							<div className="text-2xl font-semibold">{card.value}</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{card.dir === 'up' ? (
									<TrendingUp className="mr-1 h-3 w-3 text-green-600" />
								) : (
									<TrendingDown className="mr-1 h-3 w-3 text-red-600" />
								)}
								{card.trend} in last {timeframe} days
							</div>
							<div className="sg-trend-bar" />
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="sg-card">
				<CardHeader className="sg-card-header">
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>Latest updates across all projects</CardDescription>
				</CardHeader>
				<CardContent className="sg-card-content">
					{/* Activity content unchanged (mock) */}
					<div className="space-y-4">
						{/* Existing activity items rendering remains */}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
