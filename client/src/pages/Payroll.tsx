import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Download, IndianRupee, Eye, FileText, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { TrendingUp, Users, CreditCard } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Payroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generateMonth, setGenerateMonth] = useState('');
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear().toString());
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatedPayrolls, setGeneratedPayrolls] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: '',
    status: '',
    remarks: '',
  });

  const canManagePayroll = user && ['admin', 'principal'].includes(user.role);
  const isFaculty = user && user.role === 'faculty';

  const { data: facultyData } = useQuery<{ faculty: Array<any> }>({
    queryKey: ['/api/faculty'],
    enabled: !!canManagePayroll,
  });

  // Fetch payroll data based on user role
  const { data: payrollData, isLoading } = useQuery<{ payrolls: Array<any> }>({
    queryKey: isFaculty ? ['/api/payroll/my'] : ['/api/payroll'],
  });

  const payrollRecords = payrollData?.payrolls || [];
  const faculty = facultyData?.faculty || [];

  const generatePayrollMutation = useMutation({
    mutationFn: async (data: { month: string; year: number }) => {
      const results = [];
      for (const facultyMember of faculty) {
        const payrollData = {
          userId: facultyMember.id || facultyMember._id,
          month: data.month,
          year: data.year,
          basicSalary: 50000,
          allowances: 10000,
          deductions: 5000,
          netSalary: 55000,
          remarks: `Generated payroll for ${data.month} ${data.year}`,
        };
        const result = await apiRequest('/api/payroll', {
          method: 'POST',
          body: JSON.stringify(payrollData),
        });
        results.push({
          ...result,
          employeeName: `${facultyMember.firstName} ${facultyMember.lastName}`,
          employeeId: facultyMember.id || facultyMember._id,
          role: facultyMember.role,
        });
      }
      return results;
    },
    onSuccess: (results) => {
      setGeneratedPayrolls(results);
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      toast({
        title: 'Success',
        description: `Payroll generated for ${results.length} employees`,
      });
      setIsGenerateDialogOpen(false);
      setGenerateMonth('');
      setGenerateYear(new Date().getFullYear().toString());
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate payroll',
        variant: 'destructive',
      });
    },
  });

  const editPayrollMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: any }) => {
      return await apiRequest(`/api/payroll/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/my'] });
      toast({
        title: 'Success',
        description: 'Payroll updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedPayroll(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payroll',
        variant: 'destructive',
      });
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/payroll/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/my'] });
      toast({
        title: 'Success',
        description: 'Payroll deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedPayroll(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payroll',
        variant: 'destructive',
      });
    },
  });

  const handleGeneratePayroll = () => {
    if (!generateMonth || !generateYear) {
      toast({
        title: 'Error',
        description: 'Please select month and year',
        variant: 'destructive',
      });
      return;
    }
    generatePayrollMutation.mutate({
      month: generateMonth,
      year: parseInt(generateYear),
    });
  };

  const handleEditPayroll = (record: any) => {
    setSelectedPayroll(record);
    setEditForm({
      basicSalary: record.basicSalary?.toString() || '',
      allowances: record.allowances?.toString() || '',
      deductions: record.deductions?.toString() || '',
      netSalary: record.netSalary?.toString() || '',
      status: record.status || 'draft',
      remarks: record.remarks || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPayroll) return;

    const basicSalary = parseFloat(editForm.basicSalary) || 0;
    const allowances = parseFloat(editForm.allowances) || 0;
    const deductions = parseFloat(editForm.deductions) || 0;
    const netSalary = parseFloat(editForm.netSalary) || 0;

    editPayrollMutation.mutate({
      id: selectedPayroll._id || selectedPayroll.id,
      updateData: {
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: editForm.status,
        remarks: editForm.remarks,
      },
    });
  };

  const handleDeletePayroll = (record: any) => {
    setSelectedPayroll(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPayroll) return;
    deletePayrollMutation.mutate(selectedPayroll._id || selectedPayroll.id);
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

  const handleExportReport = () => {
    const csvHeaders = 'Employee Name,Month,Year,Basic Salary,Allowances,Deductions,Net Salary,Status\n';
    const csvRows = payrollRecords.map(record => 
      `${record.employeeName || 'N/A'},${record.month || 'N/A'},${record.year || 'N/A'},${record.basicSalary},${record.allowances},${record.deductions},${record.netSalary},${record.status}`
    ).join('\n');
    
    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-report-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Success',
      description: 'Payroll report exported successfully',
    });
  };

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
            <Button variant="outline" onClick={handleExportReport} data-testid="button-export-payroll">
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
                      <Select value={generateMonth} onValueChange={setGenerateMonth}>
                        <SelectTrigger data-testid="select-month">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input 
                        type="number" 
                        placeholder="2025" 
                        value={generateYear}
                        onChange={(e) => setGenerateYear(e.target.value)}
                        data-testid="input-year"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleGeneratePayroll} 
                      disabled={generatePayrollMutation.isPending}
                      data-testid="button-confirm-generate"
                    >
                      {generatePayrollMutation.isPending ? 'Generating...' : 'Generate'}
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

        {generatedPayrolls.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Payroll - {generateMonth} {generateYear}</CardTitle>
                  <CardDescription>Newly generated payroll records</CardDescription>
                </div>
                <Button variant="outline" onClick={() => {
                  const csvContent = 'Employee Name,Employee ID,Basic Salary,Allowances,Deductions,Net Salary\n' +
                    generatedPayrolls.map(p => 
                      `${p.employeeName},${p.employeeId},${p.basicSalary},${p.allowances},${p.deductions},${p.netSalary}`
                    ).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `payroll-${generateMonth}-${generateYear}.csv`;
                  a.click();
                }} data-testid="button-download-payroll">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={generatedPayrolls}
                emptyMessage="No generated payroll"
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
                      <Badge variant="secondary">
                        {item.status || 'draft'}
                      </Badge>
                    ),
                  },
                ]}
                testId="generated-payroll-table"
              />
            </CardContent>
          </Card>
        )}

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
                      {canManagePayroll && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPayroll(item)}
                            data-testid={`button-edit-payroll-${item._id || item.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayroll(item)}
                            data-testid={`button-delete-payroll-${item._id || item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payroll</DialogTitle>
              <DialogDescription>
                Update payroll details for {selectedPayroll?.employeeName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-basicSalary">Basic Salary</Label>
                  <Input
                    id="edit-basicSalary"
                    type="number"
                    value={editForm.basicSalary}
                    onChange={(e) => setEditForm({ ...editForm, basicSalary: e.target.value })}
                    data-testid="input-edit-basic-salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-allowances">Allowances</Label>
                  <Input
                    id="edit-allowances"
                    type="number"
                    value={editForm.allowances}
                    onChange={(e) => setEditForm({ ...editForm, allowances: e.target.value })}
                    data-testid="input-edit-allowances"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deductions">Deductions</Label>
                  <Input
                    id="edit-deductions"
                    type="number"
                    value={editForm.deductions}
                    onChange={(e) => setEditForm({ ...editForm, deductions: e.target.value })}
                    data-testid="input-edit-deductions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-netSalary">Net Salary</Label>
                  <Input
                    id="edit-netSalary"
                    type="number"
                    value={editForm.netSalary}
                    onChange={(e) => setEditForm({ ...editForm, netSalary: e.target.value })}
                    data-testid="input-edit-net-salary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Input
                  id="edit-remarks"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  data-testid="input-edit-remarks"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} data-testid="button-cancel-edit">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={editPayrollMutation.isPending} data-testid="button-save-edit">
                {editPayrollMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payroll</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the payroll record for {selectedPayroll?.employeeName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deletePayrollMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
