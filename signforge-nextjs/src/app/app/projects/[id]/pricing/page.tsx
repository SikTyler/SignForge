'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Download, FileText, Calculator, DollarSign, TrendingUp } from 'lucide-react';

export default function ProjectPricingPage() {
	const params = useParams();
	const projectId = params.id as string;
	const { getProjectById, updateProject } = useProjectsStore();
	const { getSignsByProjectId, getSignTypesByProjectId } = useSignsStore();

	const project = getProjectById(projectId);
	const signs = getSignsByProjectId(projectId);
	const signTypes = getSignTypesByProjectId(projectId);

	const [taxRate, setTaxRate] = useState(project?.estimate.taxRate || 0.08);

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

	const pricingBreakdown = useMemo(() => {
		const breakdown: Record<string, { count: number; basePrice: number; total: number }> = {};
		signs.forEach((sign) => {
			const signType = signTypes.find(st => st.id === sign.signTypeId);
			if (signType) {
				const key = signType.id;
				if (!breakdown[key]) {
					breakdown[key] = { count: 0, basePrice: signType.basePrice, total: 0 };
				}
				breakdown[key].count += 1;
				breakdown[key].total = breakdown[key].count * breakdown[key].basePrice;
			}
		});
		return breakdown;
	}, [signs, signTypes]);

	const subtotal = Object.values(pricingBreakdown).reduce((sum, item) => sum + item.total, 0);
	const taxAmount = subtotal * taxRate;
	const total = subtotal + taxAmount;

	const handleTaxRateChange = (value: string) => {
		const newRate = parseFloat(value) / 100;
		setTaxRate(newRate);
		updateProject(projectId, { estimate: { ...project.estimate, taxRate: newRate, total } });
	};

	const handleExportCSV = () => {
		const csvContent = [
			['Sign Type', 'Code', 'Count', 'Base Price', 'Total'],
			...Object.entries(pricingBreakdown).map(([signTypeId, data]) => {
				const signType = signTypes.find(st => st.id === signTypeId);
				return [signType?.name || 'Unknown', signType?.code || '', data.count.toString(), formatCurrency(data.basePrice), formatCurrency(data.total)];
			}),
			['', '', '', 'Subtotal', formatCurrency(subtotal)],
			['', '', '', 'Tax', formatCurrency(taxAmount)],
			['', '', '', 'Total', formatCurrency(total)],
		].map(row => row.join(',')).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `${project.name}-pricing.csv`; a.click(); URL.revokeObjectURL(url);
	};

	const handleExportPDF = () => { alert('PDF export functionality coming soon'); };

	return (
		<div className="space-y-6">
			<PageHeader
				title="Pricing & Estimate"
				subtitle="Live estimate calculation and pricing breakdown"
				actions={(
					<div className="flex items-center space-x-2">
						<Button variant="outline" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
						<Button variant="outline" onClick={handleExportPDF}><FileText className="mr-2 h-4 w-4" />Export PDF</Button>
					</div>
				)}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<Card className="sg-card">
						<CardHeader className="sg-card-header">
							<CardTitle className="flex items-center"><Calculator className="mr-2 h-4 w-4" />Pricing Breakdown</CardTitle>
							<CardDescription>Detailed breakdown by sign type</CardDescription>
						</CardHeader>
						<CardContent className="sg-card-content space-y-4">
							{Object.entries(pricingBreakdown).map(([signTypeId, data]) => {
								const signType = signTypes.find(st => st.id === signTypeId);
								return (
									<div key={signTypeId} className="flex items-center justify-between p-4 border rounded-xl">
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<h4 className="font-medium">{signType?.name}</h4>
												<Badge variant="secondary">{signType?.code}</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{signType?.materials} • {signType?.size.w}" × {signType?.size.h}" {signType?.size.units}</p>
										</div>
										<div className="text-right grid grid-cols-3 gap-6 min-w-[320px]">
											<div>
												<p className="text-xs text-muted-foreground">Count</p>
												<p className="font-medium">{data.count}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Base Price</p>
												<p className="font-medium">{formatCurrency(data.basePrice)}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Total</p>
												<p className="font-medium">{formatCurrency(data.total)}</p>
											</div>
										</div>
									</div>
								);
							})}
							{Object.keys(pricingBreakdown).length === 0 && (
								<div className="text-center py-8 text-muted-foreground">No signs placed yet</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />Estimate Summary</CardTitle></CardHeader>
						<CardContent className="sg-card-content space-y-3">
							<div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
							<div className="flex justify-between"><span className="text-muted-foreground">Tax ({formatPercentage(taxRate)})</span><span className="font-medium">{formatCurrency(taxAmount)}</span></div>
							<div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold text-lg">{formatCurrency(total)}</span></div>
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle>Tax Settings</CardTitle><CardDescription>Adjust tax rate for this project</CardDescription></CardHeader>
						<CardContent className="sg-card-content space-y-2">
							<Label htmlFor="tax-rate">Tax Rate (%)</Label>
							<Input id="tax-rate" type="number" step="0.1" min="0" max="100" value={(taxRate * 100).toFixed(1)} onChange={(e) => handleTaxRateChange(e.target.value)} />
							<p className="text-xs text-muted-foreground">Default: 8% • Applied to subtotal</p>
						</CardContent>
					</Card>

					<Card className="sg-card">
						<CardHeader className="sg-card-header"><CardTitle className="flex items-center"><TrendingUp className="mr-2 h-4 w-4" />Project Stats</CardTitle></CardHeader>
						<CardContent className="sg-card-content space-y-3">
							<div className="flex justify-between"><span className="text-muted-foreground">Total Signs</span><span className="font-medium">{signs.length}</span></div>
							<div className="flex justify-between"><span className="text-muted-foreground">Sign Types</span><span className="font-medium">{signTypes.length}</span></div>
							<div className="flex justify-between"><span className="text-muted-foreground">Avg. Price/Sign</span><span className="font-medium">{signs.length > 0 ? formatCurrency(subtotal / signs.length) : '$0.00'}</span></div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
