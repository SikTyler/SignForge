'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProjectsStore } from '@/lib/store/projects-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { Search, Filter, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const statusColors = {
	planning: 'bg-blue-100 text-blue-800',
	active: 'bg-green-100 text-green-800',
	on_hold: 'bg-yellow-100 text-yellow-800',
	closed: 'bg-gray-100 text-gray-800',
};

export default function ProjectsPage() {
	const { projects } = useProjectsStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [orgFilter, setOrgFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	const organizations = [
		{ id: 'org-1', name: 'Acme Corporation' },
		{ id: 'org-2', name: 'Global Industries' },
		{ id: 'org-3', name: 'Tech Solutions Inc.' },
	];

	const filteredProjects = useMemo(() => {
		let filtered = projects;
		if (searchTerm) {
			filtered = filtered.filter(project =>
				project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.location.city?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (statusFilter !== 'all') {
			filtered = filtered.filter(project => project.status === statusFilter);
		}
		if (orgFilter !== 'all') {
			filtered = filtered.filter(project => project.orgId === orgFilter);
		}
		return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}, [projects, searchTerm, statusFilter, orgFilter]);

	const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
	const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Projects"
				subtitle="Manage your signage projects and track progress"
				actions={(
					<Button>
						<Building2 className="mr-2 h-4 w-4" />
						New Project
					</Button>
				)}
			/>

			<Card className="sg-card">
				<CardHeader className="sg-card-header">
					<CardTitle className="flex items-center">
						<Filter className="mr-2 h-4 w-4" /> Filters
					</CardTitle>
				</CardHeader>
				<CardContent className="sg-card-content">
					<div className="grid gap-4 md:grid-cols-4">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="planning">Planning</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="on_hold">On Hold</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Select value={orgFilter} onValueChange={setOrgFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Organization" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Organizations</SelectItem>
								{organizations.map((org) => (
									<SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="text-sm text-muted-foreground flex items-center">{filteredProjects.length} projects found</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{paginatedProjects.map((project) => (
					<Link key={project.id} href={`/app/projects/${project.id}`}>
						<Card className="sg-card group transition-all">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<Avatar className="h-8 w-8"><AvatarFallback>{project.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
									<Badge className={statusColors[project.status]}> {project.status.replace('_',' ')} </Badge>
								</div>
								<CardTitle className="text-lg mt-2">{project.name}</CardTitle>
								<CardDescription>{project.clientName}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-2 gap-y-2 text-sm">
									<div className="text-muted-foreground">Location</div>
									<div>{project.location.city}, {project.location.state}</div>
									<div className="text-muted-foreground">Signs</div>
									<div>{project.stats.signsTotal} total</div>
									<div className="text-muted-foreground">Installed</div>
									<div>{project.stats.signsInstalled} ({Math.round(project.stats.signsInstalled / project.stats.signsTotal * 100)}%)</div>
									<div className="text-muted-foreground">Updated</div>
									<div>{formatDate(project.updatedAt)}</div>
								</div>
								<div className="mt-3 h-6 bg-gradient-to-r from-transparent to-[hsl(var(--accent)_/_0.08)] rounded opacity-0 group-hover:opacity-100 transition-opacity" />
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-end space-x-2">
					<Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
						<ChevronLeft className="h-4 w-4" /> Previous
					</Button>
					<div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
					<Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
						Next <ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
