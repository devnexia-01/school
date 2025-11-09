import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2 } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentTrackingProps {
  className?: string;
}

export function PaymentTracking({ className }: PaymentTrackingProps) {
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const queryParams = new URLSearchParams();
  if (selectedSchool !== 'all') queryParams.append('school', selectedSchool);
  if (selectedStatus !== 'all') queryParams.append('status', selectedStatus);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const { data: paymentsData, isLoading } = useQuery<{ payments: any[] }>({
    queryKey: ['/api/fee-payments/all', selectedSchool, selectedStatus, startDate, endDate],
  });

  const { data: tenantsData } = useQuery<{ tenants: any[] }>({
    queryKey: ['/api/tenants'],
  });

  const payments = paymentsData?.payments || [];
  const schools = tenantsData?.tenants || [];

  const totalCollected = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const headers = ['School', 'Student', 'Amount', 'Date', 'Status', 'Payment Method'];
    const csvData = payments.map(p => [
      p.tenantName || 'N/A',
      p.studentName || 'N/A',
      p.amount,
      format(new Date(p.paymentDate), 'dd/MM/yyyy'),
      p.status,
      p.paymentMethod || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
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

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600" data-testid="text-total-collected">
                {formatCurrencyINR(totalCollected)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600" data-testid="text-total-pending">
                {formatCurrencyINR(totalPending)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600" data-testid="text-total-overdue">
                {formatCurrencyINR(totalOverdue)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>All payments across all schools</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={payments.length === 0}
              data-testid="button-export-csv"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>School</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger data-testid="select-school-filter">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={payments}
              emptyMessage="No payments found"
              columns={[
                {
                  key: 'school',
                  header: 'School',
                  cell: (item) => item.tenantName || 'N/A',
                },
                {
                  key: 'student',
                  header: 'Student',
                  cell: (item) => item.studentName || 'N/A',
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  cell: (item) => (
                    <span className="font-mono font-medium">
                      {formatCurrencyINR(item.amount)}
                    </span>
                  ),
                },
                {
                  key: 'date',
                  header: 'Date',
                  cell: (item) => format(new Date(item.paymentDate), 'dd MMM yyyy'),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  ),
                },
                {
                  key: 'method',
                  header: 'Payment Method',
                  cell: (item) => item.paymentMethod || 'N/A',
                },
              ]}
              testId="payment-tracking-table"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
