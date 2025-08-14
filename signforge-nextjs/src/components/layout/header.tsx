'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Moon, Sun, Maximize2, Minimize2, Search } from 'lucide-react';

export function Header() {
	const pathname = usePathname();
	const { theme, density, toggleTheme, toggleDensity, setCmdkOpen } = useUIStore();

	return (
		<header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
			<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 bg-card text-foreground px-3 py-1 rounded ring-2 ring-primary">Skip to content</a>
			<div className="h-14 flex items-center px-6">
				{/* Left: breadcrumbs / context */}
				<nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
					{/* Placeholder: can be replaced with real breadcrumbs per route */}
					<span>{pathname}</span>
				</nav>

				{/* Center: AI search trigger */}
				<div className="flex-1 max-w-xl mx-auto px-6">
					<Button
						variant="outline"
						className="w-full justify-start text-muted-foreground h-9"
						onClick={() => setCmdkOpen(true)}
						aria-label="Open global search"
					>
						<Search className="h-4 w-4 mr-2" />
						<span>Ask AI… e.g., How many signs remain on Project A?</span>
						<kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
							<span className="text-xs">⌘</span>K
						</kbd>
					</Button>
				</div>

				{/* Right: toggles + avatar */}
				<div className="flex items-center space-x-1">
					<Button variant="ghost" size="sm" onClick={toggleDensity} aria-label="Toggle density">
						{density === 'compact' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
					</Button>
					<Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
						{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
					</Button>
					<Avatar className="h-8 w-8">
						<AvatarFallback>AD</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}
