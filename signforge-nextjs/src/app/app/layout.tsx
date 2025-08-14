'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui-store';
import { seedAllData, isDataSeeded } from '@/lib/data/seed';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { GlobalSearch } from '@/components/common/global-search';
import '../print.css';

export default function AppLayout({ children }: { children: React.ReactNode; }) {
	const { theme, density } = useUIStore();

	useEffect(() => {
		if (!isDataSeeded()) { seedAllData(); }
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		if (density === 'compact') root.classList.add('sg-compact');
		else root.classList.remove('sg-compact');
	}, [density]);

	return (
		<ThemeProvider attribute="class" defaultTheme="light" value={{ light: 'light', dark: 'dark' }}>
			<div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
				<div className="flex h-screen bg-background">
					<Sidebar />
					<div className="flex-1 flex flex-col overflow-hidden">
						<Header />
						<main id="main" className="flex-1 overflow-y-auto p-6">
							{children}
						</main>
					</div>
				</div>
				<GlobalSearch />
			</div>
		</ThemeProvider>
	);
}
