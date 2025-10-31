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
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';

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
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const { data: profileData } = useQuery({
    queryKey: ['/api/student/profile'],
    enabled: isStudent,
  });

  const studentId = profileData?.student?._id;

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: any[] }>({
    queryKey: isStudent ? ['/api/fee-payments/student', studentId] : ['/api/fee-payments'],
    enabled: !isStudent || !!studentId,
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
        <Breadcrumb items={[{ label: isStudent ? 'My Fees' : 'Fee Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{isStudent ? 'My Fees' : 'Fee Management'}</h1>
            <p className="text-muted-foreground mt-1">
              {isStudent ? 'View your fee payment history and pending fees' : 'Track fee collection and payment status'}
            </p>
          </div>
          <Button variant="outline" data-testid="button-export-fees">
            <Download className="mr-2 h-4 w-4" />
            Export {isStudent ? 'Fee Statement' : 'Report'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={isStudent ? "Total Paid" : "Total Collected"}
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
            title={isStudent ? "Total Amount" : "Collection Rate"}
            value={isStudent ? formatCurrencyINR(totalAmount) : `${collectionRate.toFixed(1)}%`}
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
                <CardTitle>{isStudent ? 'My Payment History' : 'Recent Payments'}</CardTitle>
                <CardDescription>{isStudent ? 'Your fee payment records' : 'Latest fee payments and pending amounts'}</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
                ) : (
                  <DataTable
                    data={feePayments}
                    emptyMessage={isStudent ? "No payment records found" : "No payments found"}
                    columns={
                      isStudent ? [
                        {
                          key: 'feeStructureId',
                          header: 'Fee Type',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{item.feeStructureId?.name || 'Fee Payment'}</p>
                              {item.feeStructureId?.description && (
                                <p className="text-sm text-muted-foreground">{item.feeStructureId.description}</p>
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
                          key: 'paymentDate',
                          header: 'Payment Date',
                          cell: (item) => <span className="text-sm">{item.paymentDate ? format(new Date(item.paymentDate), 'MMM dd, yyyy') : 'N/A'}</span>,
                        },
                        {
                          key: 'paymentMode',
                          header: 'Payment Method',
                          cell: (item) => <span className="text-sm capitalize">{item.paymentMode || 'N/A'}</span>,
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
                              data-testid={`badge-${item.status}`}
                            >
                              {item.status}
                            </Badge>
                          ),
                        },
                        {
                          key: 'receiptNumber',
                          header: 'Receipt',
                          cell: (item) => (
                            item.receiptNumber ? (
                              <Button variant="ghost" size="sm" data-testid="button-view-receipt">
                                {item.receiptNumber}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )
                          ),
                        },
                      ] : [
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
                      ]
                    }
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
                    <CardTitle>{isStudent ? 'Applicable Fees' : 'Fee Structures'}</CardTitle>
                    <CardDescription>{isStudent ? 'Fee structures applicable to you' : 'Manage fee types and amounts'}</CardDescription>
                  </div>
                  {!isStudent && (
                    <Button data-testid="button-add-fee-structure">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Fee Structure
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {structuresLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading fee structures...</div>
                ) : (
                  <DataTable
                    data={feeStructures}
                    emptyMessage={isStudent ? "No applicable fees found" : "No fee structures found. Add one to get started."}
                    columns={[
                      {
                        key: 'name',
                        header: 'Fee Name',
                        cell: (item) => (
                          <div>
                            <p className="font-medium" data-testid={`text-fee-name-${item._id}`}>{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'amount',
                        header: 'Amount',
                        cell: (item) => <span className="font-mono font-medium" data-testid={`text-fee-amount-${item._id}`}>{formatCurrencyINR(item.amount)}</span>,
                      },
                      {
                        key: 'dueDate',
                        header: 'Due Date',
                        cell: (item) => (
                          <span className="text-sm" data-testid={`text-fee-due-${item._id}`}>
                            {item.dueDate ? format(new Date(item.dueDate), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                        ),
                      },
                      ...(!isStudent ? [{
                        key: 'actions',
                        header: 'Actions',
                        cell: () => (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        ),
                      }] : []),
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
