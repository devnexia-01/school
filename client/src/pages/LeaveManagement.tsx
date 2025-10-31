import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Plus, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';

const leaveFormSchema = z.object({
  leaveType: z.string().min(1, 'Please select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type LeaveFormData = z.infer<typeof leaveFormSchema>;

type LeaveRequest = {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
};

export default function LeaveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const canApproveLeave = user && ['admin', 'principal'].includes(user.role);
  const canApplyLeave = user && ['faculty'].includes(user.role);

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const { data: leaveRequestsData, isLoading } = useQuery<{ leaveRequests: LeaveRequest[] }>({
    queryKey: ['/api/leave-requests'],
    enabled: !!user,
  });

  const leaveRequests = leaveRequestsData?.leaveRequests || [];

  const applyLeaveMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const response = await apiRequest('/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Leave Applied',
        description: 'Your leave request has been submitted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
      setIsApplyDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request.',
        variant: 'destructive',
      });
    },
  });

  const updateLeaveStatusMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string }) => {
      const response = await apiRequest(`/api/leave-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewNotes }),
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        description: `Leave request has been ${variables.status}.`,
        variant: variables.status === 'approved' ? 'default' : 'destructive',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update leave status.',
        variant: 'destructive',
      });
    },
  });

  const handleApplyLeave = (data: LeaveFormData) => {
    applyLeaveMutation.mutate(data);
  };

  const handleApproveLeave = (leave: LeaveRequest) => {
    updateLeaveStatusMutation.mutate({ id: leave._id, status: 'approved' });
  };

  const handleRejectLeave = (leave: LeaveRequest) => {
    updateLeaveStatusMutation.mutate({ id: leave._id, status: 'rejected' });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingRequests = leaveRequests.filter(l => l.status === 'pending');
  const myRequests = canApplyLeave ? leaveRequests.filter(l => l.userId._id === user?.id) : [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-7xl">
          <Breadcrumb items={[{ label: 'Leave Management' }]} />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleApplyLeave)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="leaveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-leave-type">
                                <SelectValue placeholder="Select leave type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sick">Sick Leave</SelectItem>
                              <SelectItem value="casual">Casual Leave</SelectItem>
                              <SelectItem value="earned">Earned Leave</SelectItem>
                              <SelectItem value="maternity">Maternity Leave</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" data-testid="input-start-date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" data-testid="input-end-date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter reason for leave"
                              rows={3}
                              data-testid="textarea-reason"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsApplyDialogOpen(false)} 
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        data-testid="button-submit-leave"
                        disabled={applyLeaveMutation.isPending}
                      >
                        {applyLeaveMutation.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
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
                              <p className="font-medium">{item.userId.firstName} {item.userId.lastName}</p>
                              <p className="text-sm text-muted-foreground">{item.userId.email}</p>
                            </div>
                          ),
                        },
                        {
                          key: 'leaveType',
                          header: 'Leave Type',
                          cell: (item) => (
                            <span className="capitalize">{item.leaveType.replace('_', ' ')}</span>
                          ),
                        },
                        {
                          key: 'duration',
                          header: 'Duration',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{calculateDays(item.startDate, item.endDate)} days</p>
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
                                data-testid={`button-approve-${item._id}`}
                                disabled={updateLeaveStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1 text-green-600" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectLeave(item)}
                                data-testid={`button-reject-${item._id}`}
                                disabled={updateLeaveStatusMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1 text-red-600" />
                                Reject
                              </Button>
                            </div>
                          ) : item.reviewedBy ? (
                            <div className="text-sm text-muted-foreground">
                              Reviewed by {item.reviewedBy.firstName} {item.reviewedBy.lastName}
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
                              <p className="font-medium">{item.userId.firstName} {item.userId.lastName}</p>
                              <p className="text-sm text-muted-foreground">{item.userId.email}</p>
                            </div>
                          ),
                        },
                        {
                          key: 'leaveType',
                          header: 'Leave Type',
                          cell: (item) => (
                            <span className="capitalize">{item.leaveType.replace('_', ' ')}</span>
                          ),
                        },
                        {
                          key: 'duration',
                          header: 'Duration',
                          cell: (item) => (
                            <div>
                              <p className="font-medium">{calculateDays(item.startDate, item.endDate)} days</p>
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
                                data-testid={`button-approve-pending-${item._id}`}
                                disabled={updateLeaveStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1 text-green-600" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectLeave(item)}
                                data-testid={`button-reject-pending-${item._id}`}
                                disabled={updateLeaveStatusMutation.isPending}
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
                        cell: (item) => (
                          <span className="capitalize">{item.leaveType.replace('_', ' ')}</span>
                        ),
                      },
                      {
                        key: 'duration',
                        header: 'Duration',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{calculateDays(item.startDate, item.endDate)} days</p>
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
                        cell: (item) => new Date(item.createdAt).toLocaleDateString(),
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
