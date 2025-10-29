import { useQuery } from '@tanstack/react-query';
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

interface FeePayment {
  id: string;
  student: string;
  class: string;
  amount: number;
  status: string;
  date: string;
  receipt: string;
}

interface FeeStructure {
  _id: string;
  name: string;
  amount: number;
  classId: string;
  dueDate?: string;
  description?: string;
}

export default function Fees() {
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: FeePayment[] }>({
    queryKey: ['/api/fee-payments'],
  });

  const { data: structuresData, isLoading: structuresLoading } = useQuery<{ feeStructures: FeeStructure[] }>({
    queryKey: ['/api/fee-structures'],
  });

  const feePayments = paymentsData?.payments || [];
  const feeStructures = structuresData?.feeStructures || [];

  const totalCollected = feePayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = feePayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = feePayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAmount = totalCollected + pendingAmount + overdueAmount;
  const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0;

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
            value={formatCurrencyINR(totalCollected)}
            icon={IndianRupee}
            testId="stat-total-collected"
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrencyINR(pendingAmount)}
            icon={AlertCircle}
            testId="stat-pending-payments"
          />
          <StatCard
            title="Overdue"
            value={formatCurrencyINR(overdueAmount)}
            icon={TrendingUp}
            testId="stat-overdue"
          />
          <StatCard
            title="Collection Rate"
            value={`${collectionRate.toFixed(1)}%`}
            icon={CreditCard}
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
                {paymentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
                ) : (
                  <DataTable
                    data={feePayments}
                    emptyMessage="No payments found"
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
                        cell: (item) => (
                          item.receipt ? (
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )
                        ),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fee Structures</CardTitle>
                    <CardDescription>Manage fee types and amounts</CardDescription>
                  </div>
                  <Button data-testid="button-add-fee-structure">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fee Structure
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {structuresLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading fee structures...</div>
                ) : (
                  <DataTable
                    data={feeStructures}
                    emptyMessage="No fee structures found. Add one to get started."
                    columns={[
                      {
                        key: 'name',
                        header: 'Fee Name',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'amount',
                        header: 'Amount',
                        cell: (item) => <span className="font-mono font-medium">{formatCurrencyINR(item.amount)}</span>,
                      },
                      {
                        key: 'dueDate',
                        header: 'Due Date',
                        cell: (item) => (
                          <span className="text-sm">
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        ),
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
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
