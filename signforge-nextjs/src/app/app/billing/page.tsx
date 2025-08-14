'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, FileText, Plus, DollarSign, Receipt, Building2, TrendingUp, Eye } from 'lucide-react';

export default function BillingPage() {
	const [activeTab, setActiveTab] = useState('invoices');

	const invoices = [
		{ id: 'INV-001', projectName: 'Downtown Office Complex', clientName: 'Acme Corp', amount: 135000, status: 'sent', dueDate: '2024-02-15', createdAt: '2024-01-15' },
		{ id: 'INV-002', projectName: 'Hospital Wayfinding System', clientName: 'City General Hospital', amount: 345600, status: 'paid', dueDate: '2024-01-30', createdAt: '2024-01-01' },
		{ id: 'INV-003', projectName: 'Airport Terminal Signs', clientName: 'Metro Airport Authority', amount: 194400, status: 'draft', dueDate: '2024-03-01', createdAt: '2024-01-20' },
	];

	const purchaseOrders = [
		{ id: 'PO-001', vendorName: 'Premier Signs & Graphics', projectName: 'Downtown Office Complex', amount: 85000, status: 'approved', dueDate: '2024-02-10', createdAt: '2024-01-10' },
		{ id: 'PO-002', vendorName: 'Express Graphics', projectName: 'Shopping Mall Renovation', amount: 120000, status: 'pending', dueDate: '2024-02-20', createdAt: '2024-01-18' },
	];

	const vendorBills = [
		{ id: 'VB-001', vendorName: 'Install Pro Services', projectName: 'Hospital Wayfinding System', amount: 25000, status: 'paid', dueDate: '2024-01-25', createdAt: '2024-01-05' },
		{ id: 'VB-002', vendorName: 'Quality Signs Co.', projectName: 'University Campus Signage', amount: 180000, status: 'pending', dueDate: '2024-02-28', createdAt: '2024-01-22' },
	];

	const costCodes = [
		{ code: '1000', name: 'Labor', description: 'Direct labor costs' },
		{ code: '2000', name: 'Materials', description: 'Raw materials and supplies' },
		{ code: '3000', name: 'Subcontract', description: 'Subcontractor services' },
		{ code: '4000', name: 'Equipment', description: 'Equipment rental and maintenance' },
		{ code: '5000', name: 'Overhead', description: 'Indirect costs and overhead' },
	];

	const statusColors = { draft: 'bg-gray-100 text-gray-800', pending: 'bg-yellow-100 text-yellow-800', sent: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', paid: 'bg-green-100 text-green-800' };

	const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
	const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
	const totalOutstanding = totalInvoiced - totalPaid;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Billing"
				subtitle="Manage invoices, purchase orders, and vendor bills"
				actions={(
					<div className="flex items-center space-x-2">
						<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Reports</Button>
						<Button><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
					</div>
				)}
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Total Invoiced</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div><p className="text-xs text-muted-foreground">{invoices.length} invoices</p></CardContent></Card>
				<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Total Paid</CardTitle><Receipt className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div><p className="text-xs text-muted-foreground">{invoices.filter(inv => inv.status === 'paid').length} paid</p></CardContent></Card>
				<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Outstanding</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div><p className="text-xs text-muted-foreground">{invoices.filter(inv => inv.status !== 'paid').length} pending</p></CardContent></Card>
				<Card className="sg-card"><CardHeader className="sg-card-header flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Vendor Bills</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent className="sg-card-content"><div className="text-2xl font-bold">{formatCurrency(vendorBills.reduce((s, vb) => s + vb.amount, 0))}</div><p className="text-xs text-muted-foreground">{vendorBills.length} bills</p></CardContent></Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-4"><TabsTrigger value="invoices">Invoices</TabsTrigger><TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger><TabsTrigger value="vendor-bills">Vendor Bills</TabsTrigger><TabsTrigger value="cost-codes">Cost Codes</TabsTrigger></TabsList>

				<TabsContent value="invoices" className="space-y-4">
					<Card className="sg-card"><CardHeader className="sg-card-header"><CardTitle>Client Invoices</CardTitle><CardDescription>Invoices sent to clients for project work</CardDescription></CardHeader><CardContent className="sg-card-content"><div className="space-y-4">{invoices.map((invoice) => (<div key={invoice.id} className="flex items-center justify-between p-4 border rounded-xl"><div className="flex-1"><div className="flex items-center space-x-2"><h4 className="font-medium">{invoice.id}</h4><Badge className={statusColors[invoice.status as keyof typeof statusColors]}>{invoice.status}</Badge></div><p className="text-sm text-muted-foreground">{invoice.projectName}</p><p className="text-xs text-muted-foreground">{invoice.clientName}</p></div><div className="text-right"><div className="font-medium">{formatCurrency(invoice.amount)}</div><div className="text-sm text-muted-foreground">Due: {formatDate(invoice.dueDate)}</div></div><div className="flex items-center space-x-2"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
				</TabsContent>

				<TabsContent value="purchase-orders" className="space-y-4">
					<Card className="sg-card"><CardHeader className="sg-card-header"><CardTitle>Purchase Orders</CardTitle><CardDescription>Purchase orders sent to vendors</CardDescription></CardHeader><CardContent className="sg-card-content"><div className="space-y-4">{purchaseOrders.map((po) => (<div key={po.id} className="flex items-center justify-between p-4 border rounded-xl"><div className="flex-1"><div className="flex items-center space-x-2"><h4 className="font-medium">{po.id}</h4><Badge className={statusColors[po.status as keyof typeof statusColors]}>{po.status}</Badge></div><p className="text-sm text-muted-foreground">{po.projectName}</p><p className="text-xs text-muted-foreground">{po.vendorName}</p></div><div className="text-right"><div className="font-medium">{formatCurrency(po.amount)}</div><div className="text-sm text-muted-foreground">Due: {formatDate(po.dueDate)}</div></div><div className="flex items-center space-x-2"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
				</TabsContent>

				<TabsContent value="vendor-bills" className="space-y-4">
					<Card className="sg-card"><CardHeader className="sg-card-header"><CardTitle>Vendor Bills</CardTitle><CardDescription>Bills received from vendors</CardDescription></CardHeader><CardContent className="sg-card-content"><div className="space-y-4">{vendorBills.map((bill) => (<div key={bill.id} className="flex items-center justify-between p-4 border rounded-xl"><div className="flex-1"><div className="flex items-center space-x-2"><h4 className="font-medium">{bill.id}</h4><Badge className={statusColors[bill.status as keyof typeof statusColors]}>{bill.status}</Badge></div><p className="text-sm text-muted-foreground">{bill.projectName}</p><p className="text-xs text-muted-foreground">{bill.vendorName}</p></div><div className="text-right"><div className="font-medium">{formatCurrency(bill.amount)}</div><div className="text-sm text-muted-foreground">Due: {formatDate(bill.dueDate)}</div></div><div className="flex items-center space-x-2"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
				</TabsContent>

				<TabsContent value="cost-codes" className="space-y-4">
					<Card className="sg-card"><CardHeader className="sg-card-header"><CardTitle>Cost Codes</CardTitle><CardDescription>Standard cost codes for project accounting</CardDescription></CardHeader><CardContent className="sg-card-content"><div className="space-y-4">{costCodes.map((code) => (<div key={code.code} className="flex items-center justify-between p-4 border rounded-xl"><div className="flex-1"><div className="flex items-center space-x-2"><h4 className="font-medium">{code.code}</h4><Badge variant="secondary">{code.name}</Badge></div><p className="text-sm text-muted-foreground">{code.description}</p></div><div className="flex items-center space-x-2"><Button variant="ghost" size="sm">Edit</Button></div></div>))}</div></CardContent></Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
