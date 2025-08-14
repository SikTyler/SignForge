'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	LayoutDashboard,
	FolderOpen,
	MapPin,
	CreditCard,
	MoreHorizontal,
	Info,
} from 'lucide-react';

const navigation = [
	{ name: 'Dashboard', href: '/app', icon: LayoutDashboard },
	{ name: 'Projects', href: '/app/projects', icon: FolderOpen },
	{ name: 'Signs', href: '/app/signs', icon: MapPin },
	{ name: 'Billing', href: '/app/billing', icon: CreditCard },
	{ name: 'More', href: '#', icon: MoreHorizontal },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="hidden md:flex h-screen w-[260px] flex-col border-r bg-background">
			<div className="px-4 pt-4 pb-2">
				<div className="flex items-center space-x-2">
					<Avatar className="h-8 w-8">
						<AvatarFallback>SF</AvatarFallback>
					</Avatar>
					<div>
						<div className="text-sm font-semibold leading-tight">SignForge</div>
						<div className="text-xs text-muted-foreground">Signage Manager</div>
					</div>
				</div>
			</div>
			<nav className="flex-1 space-y-1 px-2">
				{navigation.map((item) => {
					const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
					return (
						<Link key={item.name} href={item.href} className="block">
							<TooltipProvider delayDuration={200}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant={isActive ? 'secondary' : 'ghost'}
											className={cn(
												'sg-nav-item h-9 px-3 text-sm',
												isActive && 'sg-nav-item-active'
											)}
										>
											<item.icon className="mr-2 h-4 w-4" />
											{item.name}
										</Button>
									</TooltipTrigger>
									<TooltipContent side="right">{item.name}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Link>
					);
				})}
			</nav>
			<div className="p-3">
				<div className="sg-card">
					<div className="sg-card-content">
						<div className="flex items-start space-x-2">
							<Info className="h-4 w-4 text-muted-foreground mt-0.5" />
							<div className="text-xs leading-relaxed text-muted-foreground">
								Tip: Press <kbd className="px-1 py-0.5 border rounded text-[10px]">Ctrl</kbd>+<kbd className="px-1 py-0.5 border rounded text-[10px]">K</kbd> to search.
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
