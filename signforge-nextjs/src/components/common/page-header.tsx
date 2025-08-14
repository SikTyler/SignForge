"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	className?: string;
	actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, actions }: PageHeaderProps) {
	return (
		<div className={cn('flex items-start justify-between sg-page-gutter', className)}>
			<div>
				<h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
				{subtitle && (
					<p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
				)}
			</div>
			{actions && (
				<div className="flex items-center space-x-2">{actions}</div>
			)}
		</div>
	);
}
