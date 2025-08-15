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
import { Search, Filter, ChevronLeft, ChevronRight, Building2, X, AlertCircle } from 'lucide-react';

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
	const [locationFilter, setLocationFilter] = useState('all');
	const [productionVendorFilter, setProductionVendorFilter] = useState('all');
	const [installVendorFilter, setInstallVendorFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	const organizations = [
		{ id: 'org-1', name: 'Acme Corporation' },
		{ id: 'org-2', name: 'Global Industries' },
		{ id: 'org-3', name: 'Tech Solutions Inc.' },
	];

	const locations = [
		{ id: 'ny', name: 'New York, NY' },
		{ id: 'ca', name: 'Los Angeles, CA' },
		{ id: 'tx', name: 'Houston, TX' },
		{ id: 'fl', name: 'Miami, FL' },
	];

	const vendors = [
		{ id: 'vendor-1', name: 'Premier Signs & Graphics' },
		{ id: 'vendor-2', name: 'Quality Signs Co.' },
		{ id: 'vendor-3', name: 'Express Graphics' },
		{ id: 'vendor-4', name: 'Install Pro Services' },
	];

	const clearAllFilters = () => {
		setSearchTerm('');
		setStatusFilter('all');
		setOrgFilter('all');
		setLocationFilter('all');
		setProductionVendorFilter('all');
		setInstallVendorFilter('all');
		setCurrentPage(1);
	};

	const getActiveFilters = () => {
		const filters = [];
		if (searchTerm) filters.push({ type: 'search', label: `"${searchTerm}"`, value: searchTerm });
		if (statusFilter !== 'all') filters.push({ type: 'status', label: `Status: ${statusFilter.replace('_', ' ')}`, value: statusFilter });
		if (orgFilter !== 'all') {
			const org = organizations.find(o => o.id === orgFilter);
			filters.push({ type: 'org', label: `Org: ${org?.name}`, value: orgFilter });
		}
		if (locationFilter !== 'all') {
			const loc = locations.find(l => l.id === locationFilter);
			filters.push({ type: 'location', label: `Location: ${loc?.name}`, value: locationFilter });
		}
		if (productionVendorFilter !== 'all') {
			const vendor = vendors.find(v => v.id === productionVendorFilter);
			filters.push({ type: 'prodVendor', label: `Production: ${vendor?.name}`, value: productionVendorFilter });
		}
		if (installVendorFilter !== 'all') {
			const vendor = vendors.find(v => v.id === installVendorFilter);
			filters.push({ type: 'installVendor', label: `Install: ${vendor?.name}`, value: installVendorFilter });
		}
		return filters;
	};

	const removeFilter = (filterType: string) => {
		switch (filterType) {
			case 'search': setSearchTerm(''); break;
			case 'status': setStatusFilter('all'); break;
			case 'org': setOrgFilter('all'); break;
			case 'location': setLocationFilter('all'); break;
			case 'prodVendor': setProductionVendorFilter('all'); break;
			case 'installVendor': setInstallVendorFilter('all'); break;
		}
		setCurrentPage(1);
	};

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
		// Note: locationFilter, productionVendorFilter, installVendorFilter would need matching fields in project model
		// For now, keeping existing logic as per constraints
		return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}, [projects, searchTerm, statusFilter, orgFilter]);

	const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
	const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	const activeFilters = getActiveFilters();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Projects"
				subtitle="Manage your signage projects and track progress"
			>
				<Button>
					<Building2 className="mr-2 h-4 w-4" />
					New Project
				</Button>
			</PageHeader>

			<Card className="sg-card">
				<CardContent className="sg-card-content space-y-4">
					{/* Filter Controls */}
					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
						</div>
						<Select value={orgFilter} onValueChange={setOrgFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Organization" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Organizations</SelectItem>
								{organizations.map((org) => (
									<SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={locationFilter} onValueChange={setLocationFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Location" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Locations</SelectItem>
								{locations.map((loc) => (
									<SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={productionVendorFilter} onValueChange={setProductionVendorFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Production Vendor" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Production</SelectItem>
								{vendors.map((vendor) => (
									<SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={installVendorFilter} onValueChange={setInstallVendorFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Install Vendor" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Install</SelectItem>
								{vendors.map((vendor) => (
									<SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
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
					</div>

					{/* Active Filters & Results */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{activeFilters.length > 0 && (
								<>
									<span className="text-sm text-muted-foreground">Active filters:</span>
									{activeFilters.map((filter) => (
										<Badge key={filter.type} variant="secondary" className="gap-1">
											{filter.label}
											<Button
												variant="ghost"
												size="sm"
												className="h-auto p-0 text-muted-foreground hover:text-foreground"
												onClick={() => removeFilter(filter.type)}
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									))}
									<Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
										Clear all
									</Button>
								</>
							)}
						</div>
						<div className="text-sm text-muted-foreground">
							{filteredProjects.length} projects found
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Project Cards Grid */}
			{paginatedProjects.length === 0 ? (
				<Card className="sg-card">
					<CardContent className="sg-card-content text-center py-12">
						<AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No projects match your filters</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search criteria or clear all filters to see more results.
						</p>
						<Button onClick={clearAllFilters} variant="outline">
							Reset Filters
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paginatedProjects.map((project) => (
						<Link key={project.id} href={`/app/projects/${project.id}/overview`}>
							<Card className="sg-card group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
								<CardHeader className="sg-card-header pb-2">
									<div className="flex items-center justify-between mb-3">
										<Avatar className="h-10 w-10">
											<AvatarFallback className="bg-muted text-muted-foreground font-medium">
												{project.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
											</AvatarFallback>
										</Avatar>
										<Badge className="text-xs font-medium" variant="secondary">
											{project.stats?.signsTotal || 0} signs
										</Badge>
									</div>
									<CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
										{project.name}
									</CardTitle>
									<CardDescription className="text-sm">
										{project.clientName}
									</CardDescription>
								</CardHeader>
								<CardContent className="sg-card-content pt-0 space-y-3">
									{/* Micro-grid metadata */}
									<div className="grid grid-cols-2 gap-y-1.5 text-xs">
										<div className="text-muted-foreground">Client</div>
										<div className="font-medium truncate">{project.clientName || 'N/A'}</div>
										<div className="text-muted-foreground">Production</div>
										<div className="truncate">Premier Signs</div>
										<div className="text-muted-foreground">Install</div>
										<div className="truncate">Install Pro</div>
										<div className="text-muted-foreground">Status</div>
										<div className="font-medium">
											<Badge className={statusColors[project.status]} variant="outline">
												{project.status.replace('_', ' ')}
											</Badge>
										</div>
										<div className="text-muted-foreground">Updated</div>
										<div className="font-medium">{formatDate(project.updatedAt)}</div>
									</div>
									{/* Gradient footer bar */}
									<div className="h-1 bg-gradient-to-r from-transparent via-[hsl(var(--accent)_/_0.3)] to-[hsl(var(--accent))] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
					</div>
					<div className="flex items-center space-x-2">
						<Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
							<ChevronLeft className="h-4 w-4" /> Previous
						</Button>
						<div className="text-sm text-muted-foreground px-2">
							Page {currentPage} of {totalPages}
						</div>
						<Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
							Next <ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
