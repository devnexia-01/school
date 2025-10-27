import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const canApproveLeave = user && ['admin', 'principal'].includes(user.role);
  const canApplyLeave = user && ['faculty'].includes(user.role);

  const leaveRequests = [
    {
      id: '1',
      employeeName: 'Ms. Anderson',
      employeeId: 'EMP001',
      leaveType: 'Sick Leave',
      startDate: '2025-02-05',
      endDate: '2025-02-07',
      days: 3,
      reason: 'Medical treatment required',
      status: 'pending',
      appliedDate: '2025-01-25',
    },
    {
      id: '2',
      employeeName: 'Dr. Williams',
      employeeId: 'EMP002',
      leaveType: 'Casual Leave',
      startDate: '2025-02-10',
      endDate: '2025-02-12',
      days: 3,
      reason: 'Personal work',
      status: 'approved',
      appliedDate: '2025-01-20',
      reviewedBy: 'Admin',
      reviewedDate: '2025-01-21',
    },
    {
      id: '3',
      employeeName: 'Mr. Johnson',
      employeeId: 'EMP003',
      leaveType: 'Earned Leave',
      startDate: '2025-03-01',
      endDate: '2025-03-05',
      days: 5,
      reason: 'Family vacation',
      status: 'pending',
      appliedDate: '2025-01-26',
    },
    {
      id: '4',
      employeeName: 'Mrs. Brown',
      employeeId: 'EMP004',
      leaveType: 'Sick Leave',
      startDate: '2025-01-20',
      endDate: '2025-01-21',
      days: 2,
      reason: 'Fever',
      status: 'rejected',
      appliedDate: '2025-01-18',
      reviewedBy: 'Principal',
      reviewedDate: '2025-01-19',
      reviewNotes: 'Insufficient notice provided',
    },
  ];

  const handleApplyLeave = () => {
    toast({
      title: 'Leave Applied',
      description: 'Your leave request has been submitted successfully.',
    });
    setIsApplyDialogOpen(false);
  };

  const handleApproveLeave = (leave: any) => {
    toast({
      title: 'Leave Approved',
      description: `Leave request from ${leave.employeeName} has been approved.`,
    });
  };

  const handleRejectLeave = (leave: any) => {
    toast({
      title: 'Leave Rejected',
      description: `Leave request from ${leave.employeeName} has been rejected.`,
      variant: 'destructive',
    });
  };

  const pendingRequests = leaveRequests.filter(l => l.status === 'pending');
  const myRequests = user?.role === 'faculty' ? leaveRequests.filter(l => l.employeeId === 'EMP001') : [];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Leave Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Leave Management</h1>
            <p className="text-muted-foreground mt-1">Apply for and manage leave requests</p>
          </div>
          {canApplyLeave && (
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-apply-leave">
                  <Plus className="mr-2 h-4 w-4" />
                  Apply Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>Submit a new leave request</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select>
                      <SelectTrigger data-testid="select-leave-type">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                        <SelectItem value="earned">Earned Leave</SelectItem>
                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" data-testid="input-start-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" data-testid="input-end-date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for leave"
                      rows={3}
                      data-testid="textarea-reason"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handleApplyLeave} data-testid="button-submit-leave">
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue={canApproveLeave ? 'all' : 'my-requests'} className="space-y-6">
          <TabsList>
            {canApproveLeave && (
              <>
                <TabsTrigger value="all" data-testid="tab-all-requests">All Requests</TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({pendingRequests.length})
                </TabsTrigger>
              </>
            )}
            {canApplyLeave && (
              <TabsTrigger value="my-requests" data-testid="tab-my-requests">My Requests</TabsTrigger>
            )}
          </TabsList>

          {canApproveLeave && (
            <>
              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Leave Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={leaveRequests}
                      emptyMessage="No leave requests found"
                      columns={[
                        {
                          key: 'employee',
                          header: 'Employee',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{item.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{item.employeeId}</p>
                            </div>
                          ),
                        },
                        {
                          key: 'leaveType',
                          header: 'Leave Type',
                          cell: (item) => item.leaveType,
                        },
                        {
                          key: 'duration',
                          header: 'Duration',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{item.days} days</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          ),
                        },
                        {
                          key: 'reason',
                          header: 'Reason',
                          cell: (item) => (
                            <p className="max-w-xs truncate">{item.reason}</p>
                          ),
                        },
                        {
                          key: 'status',
                          header: 'Status',
                          cell: (item) => (
                            <Badge
                              variant={
                                item.status === 'approved' ? 'default' :
                                item.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {item.status}
                            </Badge>
                          ),
                        },
                        {
                          key: 'actions',
                          header: 'Actions',
                          cell: (item) => item.status === 'pending' && canApproveLeave ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveLeave(item)}
                                data-testid={`button-approve-${item.id}`}
                              >
                                <Check className="h-4 w-4 mr-1 text-green-600" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectLeave(item)}
                                data-testid={`button-reject-${item.id}`}
                              >
                                <X className="h-4 w-4 mr-1 text-red-600" />
                                Reject
                              </Button>
                            </div>
                          ) : item.reviewedBy ? (
                            <div className="text-sm text-muted-foreground">
                              Reviewed by {item.reviewedBy}
                            </div>
                          ) : null,
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={pendingRequests}
                      emptyMessage="No pending leave requests"
                      columns={[
                        {
                          key: 'employee',
                          header: 'Employee',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{item.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{item.employeeId}</p>
                            </div>
                          ),
                        },
                        {
                          key: 'leaveType',
                          header: 'Leave Type',
                          cell: (item) => item.leaveType,
                        },
                        {
                          key: 'duration',
                          header: 'Duration',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{item.days} days</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          ),
                        },
                        {
                          key: 'reason',
                          header: 'Reason',
                          cell: (item) => item.reason,
                        },
                        {
                          key: 'actions',
                          header: 'Actions',
                          cell: (item) => (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveLeave(item)}
                                data-testid={`button-approve-pending-${item.id}`}
                              >
                                <Check className="h-4 w-4 mr-1 text-green-600" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectLeave(item)}
                                data-testid={`button-reject-pending-${item.id}`}
                              >
                                <X className="h-4 w-4 mr-1 text-red-600" />
                                Reject
                              </Button>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {canApplyLeave && (
            <TabsContent value="my-requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={myRequests}
                    emptyMessage="No leave requests found"
                    columns={[
                      {
                        key: 'leaveType',
                        header: 'Leave Type',
                        cell: (item) => item.leaveType,
                      },
                      {
                        key: 'duration',
                        header: 'Duration',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{item.days} days</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        ),
                      },
                      {
                        key: 'reason',
                        header: 'Reason',
                        cell: (item) => item.reason,
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (item) => (
                          <Badge
                            variant={
                              item.status === 'approved' ? 'default' :
                              item.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {item.status}
                          </Badge>
                        ),
                      },
                      {
                        key: 'applied',
                        header: 'Applied On',
                        cell: (item) => new Date(item.appliedDate).toLocaleDateString(),
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
