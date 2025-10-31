import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Download, IndianRupee, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { TrendingUp, Users, CreditCard } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

export default function Payroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  const canManagePayroll = user && ['admin', 'principal'].includes(user.role);
  const isFaculty = user && user.role === 'faculty';

  // Fetch payroll data based on user role
  const { data: payrollData, isLoading } = useQuery<{ payrolls: Array<any> }>({
    queryKey: isFaculty ? ['/api/payroll/my'] : ['/api/payroll'],
  });

  const payrollRecords = payrollData?.payrolls || [];

  const handleGeneratePayroll = () => {
    toast({
      title: 'Payroll Generated',
      description: 'Payroll for selected month has been generated successfully.',
    });
    setIsGenerateDialogOpen(false);
  };

  const handleProcessPayment = (record: any) => {
    toast({
      title: 'Payment Processed',
      description: `Payment of ${formatCurrencyINR(record.netSalary)} to ${record.employeeName} has been processed.`,
    });
  };

  const handleViewSlip = (record: any) => {
    toast({
      title: 'Salary Slip',
      description: `Viewing salary slip for ${record.employeeName}`,
    });
  };

  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const paidAmount = payrollRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.netSalary, 0);
  const pendingAmount = totalPayroll - paidAmount;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Payroll Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee salaries and payment processing</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export-payroll">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            {canManagePayroll && (
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-generate-payroll">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Payroll
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Payroll</DialogTitle>
                    <DialogDescription>Generate payroll for selected month</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select>
                        <SelectTrigger data-testid="select-month">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="january-2025">January 2025</SelectItem>
                          <SelectItem value="february-2025">February 2025</SelectItem>
                          <SelectItem value="march-2025">March 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department (Optional)</Label>
                      <Select>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Administration</SelectItem>
                          <SelectItem value="support">Support Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button onClick={handleGeneratePayroll} data-testid="button-confirm-generate">
                      Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Payroll"
            value={formatCurrencyINR(totalPayroll)}
            icon={IndianRupee}
            trend={{ value: 5.2, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            title="Paid Amount"
            value={formatCurrencyINR(paidAmount)}
            icon={CreditCard}
          />
          <StatCard
            title="Pending"
            value={formatCurrencyINR(pendingAmount)}
            icon={TrendingUp}
          />
          <StatCard
            title="Employees"
            value={payrollRecords.length.toString()}
            icon={Users}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payroll Records</CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48" data-testid="select-month-filter">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january-2025">January 2025</SelectItem>
                  <SelectItem value="december-2024">December 2024</SelectItem>
                  <SelectItem value="november-2024">November 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={payrollRecords}
              emptyMessage="No payroll records found"
              columns={[
                {
                  key: 'employee',
                  header: 'Employee',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{item.employeeId} • {item.role}</p>
                    </div>
                  ),
                },
                {
                  key: 'basicSalary',
                  header: 'Basic Salary',
                  cell: (item) => formatCurrencyINR(item.basicSalary),
                },
                {
                  key: 'allowances',
                  header: 'Allowances',
                  cell: (item) => formatCurrencyINR(item.allowances),
                },
                {
                  key: 'deductions',
                  header: 'Deductions',
                  cell: (item) => formatCurrencyINR(item.deductions),
                },
                {
                  key: 'netSalary',
                  header: 'Net Salary',
                  cell: (item) => (
                    <p className="font-semibold text-green-600">{formatCurrencyINR(item.netSalary)}</p>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <Badge variant={item.status === 'paid' ? 'default' : item.status === 'approved' ? 'secondary' : 'outline'}>
                      {item.status}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  cell: (item) => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSlip(item)}
                        data-testid={`button-view-slip-${item.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManagePayroll && item.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessPayment(item)}
                          data-testid={`button-process-payment-${item.id}`}
                        >
                          Process Payment
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
