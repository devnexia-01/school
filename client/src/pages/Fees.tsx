import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, IndianRupee, Search } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface FeePayment {
  id: string;
  student: string;
  class: string;
  amount: number;
  status: string;
  date: string;
  receipt: string;
  admissionNumber?: string;
  paymentMode?: string;
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
  const { toast } = useToast();
  const isStudent = user?.role === 'student';
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: '',
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: profileData } = useQuery<{ student: { _id: string } }>({
    queryKey: ['/api/student/profile'],
    enabled: isStudent,
  });

  const studentId = profileData?.student?._id;

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: any[] }>({
    queryKey: isStudent ? ['/api/fee-payments/student', studentId] : ['/api/fee-payments'],
    enabled: !isStudent || !!studentId,
  });

  const { data: searchResultsData, isLoading: searchLoading } = useQuery<{ payments: any[] }>({
    queryKey: ['/api/fee-payments/search', { q: debouncedSearchQuery, status: statusFilter }],
    enabled: !isStudent && (!!debouncedSearchQuery || !!statusFilter),
  });

  const { data: structuresData, isLoading: structuresLoading } = useQuery<{ feeStructures: FeeStructure[] }>({
    queryKey: ['/api/fee-structures'],
  });

  const { data: classesData } = useQuery<{ classes: any[] }>({
    queryKey: ['/api/classes'],
    enabled: !isStudent,
  });

  const feePayments = !isStudent && (debouncedSearchQuery || statusFilter) 
    ? (searchResultsData?.payments || [])
    : (paymentsData?.payments || []);
  const feeStructures = structuresData?.feeStructures || [];
  const classes = classesData?.classes || [];
  const isLoading = isStudent ? paymentsLoading : (debouncedSearchQuery || statusFilter ? searchLoading : paymentsLoading);

  const createFeeStructureMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/fee-structures', {
        method: 'POST',
        body: JSON.stringify({
          ...feeForm,
          amount: parseFloat(feeForm.amount),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Fee structure created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fee-structures'] });
      setIsAddFeeDialogOpen(false);
      setFeeForm({
        name: '',
        amount: '',
        classId: '',
        academicYear: new Date().getFullYear().toString(),
        dueDate: '',
        description: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create fee structure',
        variant: 'destructive',
      });
    },
  });

  const handleCreateFeeStructure = () => {
    if (!feeForm.name || !feeForm.amount || !feeForm.classId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createFeeStructureMutation.mutate();
  };

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
                <div className="flex flex-col space-y-4">
                  <div>
                    <CardTitle>{isStudent ? 'My Payment History' : 'Recent Payments'}</CardTitle>
                    <CardDescription>{isStudent ? 'Your fee payment records' : 'Latest fee payments and pending amounts'}</CardDescription>
                  </div>
                  {!isStudent && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by student name, admission number, or class..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-fees"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                    <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-fee-structure">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Fee Structure
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Fee Structure</DialogTitle>
                          <DialogDescription>Create a new fee structure for a class</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="fee-name">Fee Name *</Label>
                            <Input
                              id="fee-name"
                              placeholder="e.g., Tuition Fee, Lab Fee"
                              value={feeForm.name}
                              onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                              data-testid="input-fee-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class">Class *</Label>
                            <Select value={feeForm.classId} onValueChange={(value) => setFeeForm({ ...feeForm, classId: value })}>
                              <SelectTrigger data-testid="select-class">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls._id} value={cls._id}>
                                    Class {cls.grade} {cls.section}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="amount">Amount *</Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={feeForm.amount}
                                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                                data-testid="input-amount"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="academic-year">Academic Year</Label>
                              <Input
                                id="academic-year"
                                placeholder="2025"
                                value={feeForm.academicYear}
                                onChange={(e) => setFeeForm({ ...feeForm, academicYear: e.target.value })}
                                data-testid="input-academic-year"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input
                              id="due-date"
                              type="date"
                              value={feeForm.dueDate}
                              onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                              data-testid="input-due-date"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fee-description">Description</Label>
                            <Textarea
                              id="fee-description"
                              placeholder="Optional description"
                              rows={2}
                              value={feeForm.description}
                              onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                              data-testid="textarea-description"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddFeeDialogOpen(false)} data-testid="button-cancel-fee">
                            Cancel
                          </Button>
                          <Button onClick={handleCreateFeeStructure} disabled={createFeeStructureMutation.isPending} data-testid="button-create-fee">
                            {createFeeStructureMutation.isPending ? 'Creating...' : 'Create Fee Structure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
