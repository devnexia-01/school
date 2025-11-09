import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LifeBuoy, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function RaiseTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const { toast } = useToast();

  // Fetch user's ticket history
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery<{ tickets: any[] }>({
    queryKey: ['/api/support-tickets'],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; priority: string }) => {
      return await apiRequest('/api/support-tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted successfully. Our team will review it soon.',
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create support ticket',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!title || !description || !category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createTicketMutation.mutate({
      title,
      description,
      category,
      priority,
    });
  };

  const tickets = ticketsData?.tickets || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Raise Support Ticket</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Describe your issue or request in detail. Our team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-ticket-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-ticket-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="account">Account Management</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-testid="select-ticket-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              data-testid="textarea-ticket-description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTitle('');
                setDescription('');
                setCategory('');
                setPriority('medium');
              }}
              data-testid="button-reset-ticket"
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTicketMutation.isPending}
              data-testid="button-submit-ticket"
            >
              {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Ticket History</CardTitle>
          <CardDescription>View all your previously submitted support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTickets ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={tickets}
              emptyMessage="No tickets found. Submit your first support request above."
              columns={[
                {
                  key: 'ticketId',
                  header: 'Ticket ID',
                  cell: (item: any) => (
                    <span className="font-mono text-sm font-medium" data-testid={`text-ticket-id-${item.id}`}>
                      {item.ticketId}
                    </span>
                  ),
                },
                {
                  key: 'title',
                  header: 'Title',
                  cell: (item: any) => (
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.category.replace('_', ' ')}</p>
                    </div>
                  ),
                },
                {
                  key: 'priority',
                  header: 'Priority',
                  cell: (item: any) => (
                    <span className={`capitalize font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (item: any) => (
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Created',
                  cell: (item: any) => (
                    <div className="text-sm">
                      {format(new Date(item.createdAt), 'dd MMM yyyy')}
                    </div>
                  ),
                },
                {
                  key: 'assignedTo',
                  header: 'Assigned To',
                  cell: (item: any) => (
                    <span className="text-sm text-muted-foreground">
                      {item.assignedTo || 'Not assigned'}
                    </span>
                  ),
                },
              ]}
              testId="ticket-history-table"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
