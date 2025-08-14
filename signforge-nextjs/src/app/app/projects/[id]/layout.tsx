'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectsStore } from '@/lib/store/projects-store';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Home } from 'lucide-react';

const projectTabs = [
	{ value: 'overview', label: 'Overview', href: 'overview' },
	{ value: 'drawings', label: 'Drawings', href: 'drawings' },
	{ value: 'pricing', label: 'Pricing', href: 'pricing' },
	{ value: 'signs', label: 'Signs', href: 'signs' },
	{ value: 'proof', label: 'Proof', href: 'proof' },
];

export default function ProjectLayout({ children }: { children: React.ReactNode; }) {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById } = useProjectsStore();
	const project = getProjectById(projectId);

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

	return (
		<div className="space-y-6">
			{/* Breadcrumbs */}
			<nav className="flex items-center space-x-1 text-sm text-muted-foreground">
				<Link href="/app" className="flex items-center hover:text-foreground"><Home className="h-4 w-4" /></Link>
				<ChevronRight className="h-4 w-4" />
				<Link href="/app/projects" className="hover:text-foreground">Projects</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">{project.name}</span>
			</nav>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-5">
					{projectTabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value} asChild>
							<Link href={`/app/projects/${projectId}/${tab.href}`}>{tab.label}</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="mt-2">{children}</div>
		</div>
	);
}
