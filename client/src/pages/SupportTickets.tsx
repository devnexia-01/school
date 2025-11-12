import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

export default function SupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const canManageTickets = user && user.role === 'super_admin';

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['/api/support-tickets'],
    enabled: !!canManageTickets,
  });

  const tickets = (ticketsData as { tickets: any[] } | undefined)?.tickets || [];

  const approveMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest(`/api/support-tickets/${ticketId}/approve`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket has been approved and assigned.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve ticket',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest(`/api/support-tickets/${ticketId}/reject`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket has been rejected and closed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject ticket',
        variant: 'destructive',
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest(`/api/support-tickets/${ticketId}/resolve`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket has been marked as resolved.',
      });
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve ticket',
        variant: 'destructive',
      });
    },
  });

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleApproveTicket = (ticket: any) => {
    approveMutation.mutate(ticket.id);
  };

  const handleRejectTicket = (ticket: any) => {
    rejectMutation.mutate(ticket.id);
  };

  const handleResolveTicket = (ticket: any) => {
    resolveMutation.mutate(ticket.id);
  };

  const openTickets = tickets.filter((t: any) => t.status === 'open');
  const inProgressTickets = tickets.filter((t: any) => t.status === 'in_progress');
  const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!canManageTickets) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-7xl">
          <p className="text-center text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Support Tickets' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Support Tickets</h1>
            <p className="text-muted-foreground mt-1">Manage support tickets from all schools</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-48" data-testid="select-filter-priority">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold" data-testid="text-total-tickets">{tickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600" data-testid="text-open-tickets">{openTickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600" data-testid="text-in-progress-tickets">{inProgressTickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600" data-testid="text-resolved-tickets">{resolvedTickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all-tickets">All ({tickets.length})</TabsTrigger>
            <TabsTrigger value="open" data-testid="tab-open">Open ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="in-progress" data-testid="tab-in-progress">In Progress ({inProgressTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={tickets}
                  emptyMessage="No tickets found"
                  columns={[
                    {
                      key: 'ticket',
                      header: 'Ticket',
                      cell: (item: any) => (
                        <div>
                          <p className="font-medium" data-testid={`text-ticket-id-${item.id}`}>{item.ticketId}</p>
                          <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'school',
                      header: 'School',
                      cell: (item) => item.school,
                    },
                    {
                      key: 'category',
                      header: 'Category',
                      cell: (item) => item.category,
                    },
                    {
                      key: 'priority',
                      header: 'Priority',
                      cell: (item: any) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item: any) => (
                        <Badge variant={getStatusColor(item.status)} data-testid={`badge-status-${item.id}`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      ),
                    },
                    {
                      key: 'created',
                      header: 'Created',
                      cell: (item: any) => (
                        <div>
                          <p className="text-sm">{formatDate(item.createdAt)}</p>
                          <p className="text-xs text-muted-foreground">by {item.createdBy}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTicket(item)}
                            data-testid={`button-view-ticket-${item.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === 'open' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveTicket(item)}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-ticket-${item.id}`}
                              >
                                {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectTicket(item)}
                                disabled={rejectMutation.isPending}
                                data-testid={`button-reject-ticket-${item.id}`}
                              >
                                {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                              </Button>
                            </>
                          )}
                          {item.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveTicket(item)}
                              disabled={resolveMutation.isPending}
                              data-testid={`button-resolve-ticket-${item.id}`}
                            >
                              {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resolve'}
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={openTickets}
                  emptyMessage="No open tickets"
                  columns={[
                    {
                      key: 'ticket',
                      header: 'Ticket',
                      cell: (item: any) => (
                        <div>
                          <p className="font-medium">{item.ticketId}</p>
                          <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'school',
                      header: 'School',
                      cell: (item) => item.school,
                    },
                    {
                      key: 'category',
                      header: 'Category',
                      cell: (item) => item.category,
                    },
                    {
                      key: 'priority',
                      header: 'Priority',
                      cell: (item: any) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'created',
                      header: 'Created',
                      cell: (item) => formatDate(item.createdAt),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTicket(item)}
                            data-testid={`button-view-open-${item.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveTicket(item)}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-open-${item.id}`}
                          >
                            {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={inProgressTickets}
                  emptyMessage="No tickets in progress"
                  columns={[
                    {
                      key: 'ticket',
                      header: 'Ticket',
                      cell: (item: any) => (
                        <div>
                          <p className="font-medium">{item.ticketId}</p>
                          <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'school',
                      header: 'School',
                      cell: (item) => item.school,
                    },
                    {
                      key: 'assignedTo',
                      header: 'Assigned To',
                      cell: (item) => item.assignedTo || 'Unassigned',
                    },
                    {
                      key: 'priority',
                      header: 'Priority',
                      cell: (item: any) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTicket(item)}
                            data-testid={`button-view-progress-${item.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveTicket(item)}
                            disabled={resolveMutation.isPending}
                            data-testid={`button-resolve-progress-${item.id}`}
                          >
                            {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resolve'}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={resolvedTickets}
                  emptyMessage="No resolved tickets"
                  columns={[
                    {
                      key: 'ticket',
                      header: 'Ticket',
                      cell: (item: any) => (
                        <div>
                          <p className="font-medium">{item.ticketId}</p>
                          <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'school',
                      header: 'School',
                      cell: (item) => item.school,
                    },
                    {
                      key: 'resolved',
                      header: 'Resolved',
                      cell: (item) => item.resolvedAt ? formatDate(item.resolvedAt) : '-',
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(item)}
                          data-testid={`button-view-resolved-${item.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ticket Details - {selectedTicket?.ticketId}</DialogTitle>
              <DialogDescription>
                Created by {selectedTicket?.createdBy} {selectedTicket?.createdAt && formatDate(selectedTicket.createdAt)}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div>
                  <Label>School</Label>
                  <p className="mt-1">{selectedTicket.school}</p>
                </div>
                <div>
                  <Label>Title</Label>
                  <p className="mt-1 font-medium">{selectedTicket.title}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTicket.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <p className="mt-1">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className="mt-1" variant={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className="mt-1" variant={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>
                {selectedTicket.assignedTo && (
                  <div>
                    <Label>Assigned To</Label>
                    <p className="mt-1">{selectedTicket.assignedTo}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} data-testid="button-close-ticket-dialog">
                Close
              </Button>
              {selectedTicket?.status !== 'resolved' && selectedTicket?.status !== 'closed' && (
                <Button 
                  onClick={() => handleResolveTicket(selectedTicket)} 
                  disabled={resolveMutation.isPending}
                  data-testid="button-resolve-from-dialog"
                >
                  {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark as Resolved'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
