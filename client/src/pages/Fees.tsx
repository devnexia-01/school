import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, IndianRupee } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

export default function Fees() {
  const feePayments = [
    { id: '1', student: 'Sarah Johnson', class: 'Grade 10-A', amount: 5000, status: 'paid', date: '2025-01-15', receipt: 'RCP001' },
    { id: '2', student: 'Michael Chen', class: 'Grade 9-B', amount: 4500, status: 'paid', date: '2025-01-14', receipt: 'RCP002' },
    { id: '3', student: 'Emma Williams', class: 'Grade 11-A', amount: 5500, status: 'pending', date: '2025-01-10', receipt: '' },
    { id: '4', student: 'James Brown', class: 'Grade 8-C', amount: 4000, status: 'overdue', date: '2024-12-20', receipt: '' },
    { id: '5', student: 'Olivia Davis', class: 'Grade 12-A', amount: 6000, status: 'paid', date: '2025-01-12', receipt: 'RCP003' },
  ];

  const feeStructures = [
    { id: '1', name: 'Annual Tuition Fee', class: 'Grade 10', amount: 45000, dueDate: '2025-04-01' },
    { id: '2', name: 'Transport Fee', class: 'All Grades', amount: 8000, dueDate: '2025-04-01' },
    { id: '3', name: 'Library Fee', class: 'All Grades', amount: 2000, dueDate: '2025-04-01' },
    { id: '4', name: 'Sports Fee', class: 'All Grades', amount: 3000, dueDate: '2025-04-01' },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Fee Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Fee Management</h1>
            <p className="text-muted-foreground mt-1">Track fee collection and payment status</p>
          </div>
          <Button variant="outline" data-testid="button-export-fees">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Collected"
            value={formatCurrencyINR(62450)}
            icon={IndianRupee}
            trend={{ value: 12.5, label: 'vs last month', isPositive: true }}
            testId="stat-total-collected"
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrencyINR(8230)}
            icon={AlertCircle}
            testId="stat-pending-payments"
          />
          <StatCard
            title="Overdue"
            value={formatCurrencyINR(2100)}
            icon={TrendingUp}
            testId="stat-overdue"
          />
          <StatCard
            title="Collection Rate"
            value="88.4%"
            icon={CreditCard}
            trend={{ value: 5.2, label: 'vs last month', isPositive: true }}
            testId="stat-collection-rate"
          />
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
            <TabsTrigger value="structures" data-testid="tab-structures">Fee Structures</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest fee payments and pending amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={feePayments}
                  columns={[
                    {
                      key: 'student',
                      header: 'Student',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.student}</p>
                          <p className="text-sm text-muted-foreground">{item.class}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'amount',
                      header: 'Amount',
                      cell: (item) => <span className="font-mono font-medium">{formatCurrencyINR(item.amount)}</span>,
                    },
                    {
                      key: 'date',
                      header: 'Date',
                      cell: (item) => <span className="text-sm">{item.date}</span>,
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => (
                        <Badge
                          variant={
                            item.status === 'paid' ? 'default' :
                            item.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {item.status}
                        </Badge>
                      ),
                    },
                    {
                      key: 'receipt',
                      header: 'Receipt',
                      cell: (item) => item.receipt ? (
                        <span className="font-mono text-sm">{item.receipt}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item) => (
                        <Button variant="ghost" size="sm">
                          {item.status === 'paid' ? 'View Receipt' : 'Collect'}
                        </Button>
                      ),
                    },
                  ]}
                  testId="payments-table"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fee Structures</CardTitle>
                    <CardDescription>Configure fee categories and amounts</CardDescription>
                  </div>
                  <Button data-testid="button-add-fee-structure">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fee Structure
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={feeStructures}
                  columns={[
                    {
                      key: 'name',
                      header: 'Fee Category',
                      cell: (item) => <span className="font-medium">{item.name}</span>,
                    },
                    {
                      key: 'class',
                      header: 'Applicable To',
                      cell: (item) => <Badge variant="outline">{item.class}</Badge>,
                    },
                    {
                      key: 'amount',
                      header: 'Amount',
                      cell: (item) => <span className="font-mono font-medium">{formatCurrencyINR(item.amount)}</span>,
                    },
                    {
                      key: 'dueDate',
                      header: 'Due Date',
                      cell: (item) => <span className="text-sm">{item.dueDate}</span>,
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: () => (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </div>
                      ),
                    },
                  ]}
                  testId="fee-structures-table"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
