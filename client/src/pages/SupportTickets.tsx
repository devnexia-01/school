import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const canManageTickets = user && user.role === 'super_admin';

  const tickets = [
    {
      id: '1',
      ticketId: 'TKT-001',
      school: 'Springfield High School',
      title: 'Unable to add new students',
      description: 'Getting an error when trying to add new student records through the student management module.',
      category: 'Technical',
      priority: 'high',
      status: 'open',
      createdBy: 'Admin User',
      createdAt: '2025-01-26 09:30 AM',
      assignedTo: null,
    },
    {
      id: '2',
      ticketId: 'TKT-002',
      school: 'Riverside Academy',
      title: 'Request for additional faculty licenses',
      description: 'We need to add 5 more faculty members but have reached our subscription limit.',
      category: 'Billing',
      priority: 'medium',
      status: 'in_progress',
      createdBy: 'Principal',
      createdAt: '2025-01-25 02:15 PM',
      assignedTo: 'Support Team',
    },
    {
      id: '3',
      ticketId: 'TKT-003',
      school: 'Greenwood International',
      title: 'Fee payment gateway not working',
      description: 'Parents are reporting that they cannot make online payments. The payment gateway returns an error.',
      category: 'Technical',
      priority: 'urgent',
      status: 'open',
      createdBy: 'Finance Manager',
      createdAt: '2025-01-27 11:45 AM',
      assignedTo: null,
    },
    {
      id: '4',
      ticketId: 'TKT-004',
      school: 'Oakdale School',
      title: 'Question about exam module features',
      description: 'Need clarification on how to set up different grading scales for different subjects.',
      category: 'Support',
      priority: 'low',
      status: 'resolved',
      createdBy: 'Admin',
      createdAt: '2025-01-24 10:00 AM',
      assignedTo: 'Support Team',
      resolvedAt: '2025-01-25 03:30 PM',
    },
  ];

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleAssignTicket = (ticket: any) => {
    toast({
      title: 'Ticket Assigned',
      description: `Ticket ${ticket.ticketId} has been assigned to support team.`,
    });
  };

  const handleResolveTicket = (ticket: any) => {
    toast({
      title: 'Ticket Resolved',
      description: `Ticket ${ticket.ticketId} has been marked as resolved.`,
    });
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

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
      default:
        return 'outline';
    }
  };

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
                <p className="text-3xl font-bold">{tickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{openTickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{inProgressTickets.length}</p>
                <p className="text-sm text-muted-foreground mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{resolvedTickets.length}</p>
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
                      cell: (item) => (
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
                      cell: (item) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => (
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      ),
                    },
                    {
                      key: 'created',
                      header: 'Created',
                      cell: (item) => (
                        <div>
                          <p className="text-sm">{item.createdAt}</p>
                          <p className="text-xs text-muted-foreground">by {item.createdBy}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item) => canManageTickets ? (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignTicket(item)}
                              data-testid={`button-assign-ticket-${item.id}`}
                            >
                              Assign
                            </Button>
                          )}
                          {item.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveTicket(item)}
                              data-testid={`button-resolve-ticket-${item.id}`}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      ) : null,
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
                      cell: (item) => (
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
                      cell: (item) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'created',
                      header: 'Created',
                      cell: (item) => item.createdAt,
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item) => canManageTickets ? (
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
                            onClick={() => handleAssignTicket(item)}
                            data-testid={`button-assign-open-${item.id}`}
                          >
                            Assign
                          </Button>
                        </div>
                      ) : null,
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
                      cell: (item) => (
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
                      cell: (item) => (
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item) => canManageTickets ? (
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
                            data-testid={`button-resolve-progress-${item.id}`}
                          >
                            Resolve
                          </Button>
                        </div>
                      ) : null,
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
                      cell: (item) => (
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
                      cell: (item) => item.resolvedAt || '-',
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: (item) => (
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
                Created by {selectedTicket?.createdBy} on {selectedTicket?.createdAt}
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
              {selectedTicket?.status !== 'resolved' && canManageTickets && (
                <Button onClick={() => {
                  handleResolveTicket(selectedTicket);
                  setIsViewDialogOpen(false);
                }} data-testid="button-resolve-from-dialog">
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
