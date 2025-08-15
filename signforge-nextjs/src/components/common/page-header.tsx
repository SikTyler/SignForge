'use client';

import React from 'react';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	children?: React.ReactNode; // For actions
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
	return (
		<div className="flex items-start justify-between mb-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">{title}</h1>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			{children && (
				<div className="flex items-center space-x-2">
					{children}
				</div>
			)}
		</div>
	);
}