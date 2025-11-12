import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Download, DollarSign, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrencyINR } from '@/lib/utils';
import { format } from 'date-fns';

export default function PaymentTracking() {
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const canViewPayments = user && user.role === 'super_admin';

  const queryParams = new URLSearchParams();
  if (selectedSchool !== 'all') queryParams.append('school', selectedSchool);
  if (selectedStatus !== 'all') queryParams.append('status', selectedStatus);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/fee-payments/all', selectedSchool, selectedStatus, startDate, endDate],
    enabled: !!canViewPayments,
  });

  const { data: tenantsData } = useQuery({
    queryKey: ['/api/tenants'],
    enabled: !!canViewPayments,
  });

  const payments = (paymentsData as { payments: any[] } | undefined)?.payments || [];
  const schools = (tenantsData as { tenants: any[] } | undefined)?.tenants || [];

  const totalCollected = payments
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter((p: any) => p.status === 'overdue')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const headers = ['School', 'Student', 'Fee Type', 'Amount', 'Payment Date', 'Status', 'Payment Method'];
    const csvData = payments.map((p: any) => [
      p.tenantName || 'N/A',
      p.studentName || 'N/A',
      p.feeType || 'N/A',
      p.amount,
      format(new Date(p.paymentDate || p.createdAt), 'dd/MM/yyyy'),
      p.status,
      p.paymentMethod || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row: any[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-tracking-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!canViewPayments) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-7xl">
          <p className="text-center text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Payment Tracking' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Payment Tracking</h1>
            <p className="text-muted-foreground mt-1">Track all fee payments across schools</p>
          </div>
          <Button onClick={handleExportCSV} data-testid="button-export-payments">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Collected"
            value={formatCurrencyINR(totalCollected)}
            icon={DollarSign}
            trend={{ value: 12, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrencyINR(totalPending)}
            icon={Clock}
          />
          <StatCard
            title="Overdue Payments"
            value={formatCurrencyINR(totalOverdue)}
            icon={AlertCircle}
          />
          <StatCard
            title="Total Transactions"
            value={payments.length.toString()}
            icon={CheckCircle2}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger id="school" data-testid="select-school">
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map((school: any) => (
                      <SelectItem key={school._id} value={school._id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={payments}
                emptyMessage="No payment transactions found"
                columns={[
                  {
                    key: 'school',
                    header: 'School',
                    cell: (item: any) => (
                      <div>
                        <p className="font-medium">{item.tenantName || 'N/A'}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'student',
                    header: 'Student',
                    cell: (item: any) => (
                      <div>
                        <p className="font-medium">{item.studentName || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{item.className || 'N/A'}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'feeType',
                    header: 'Fee Type',
                    cell: (item: any) => item.feeType || 'N/A',
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    cell: (item: any) => (
                      <p className="font-medium">{formatCurrencyINR(item.amount)}</p>
                    ),
                  },
                  {
                    key: 'paymentDate',
                    header: 'Payment Date',
                    cell: (item: any) => {
                      const date = item.paymentDate || item.createdAt;
                      return date ? format(new Date(date), 'dd MMM yyyy') : 'N/A';
                    },
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (item: any) => (
                      <Badge variant={getStatusColor(item.status)} data-testid={`badge-status-${item._id}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </Badge>
                    ),
                  },
                  {
                    key: 'paymentMethod',
                    header: 'Payment Method',
                    cell: (item: any) => item.paymentMethod || 'N/A',
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
