import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Maximize2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Communication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canCreateAnnouncement = user && ['admin', 'principal'].includes(user.role);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetRole: '',
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery<{ announcements: Array<any> }>({
    queryKey: ['/api/announcements'],
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: Array<any> }>({
    queryKey: ['/api/messages'],
  });

  const announcements = announcementsData?.announcements || [];
  const messages = messagesData?.messages || [];

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...announcementForm,
        targetRole: announcementForm.targetRole || undefined,
      };
      return await apiRequest('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Announcement created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      setIsCreateDialogOpen(false);
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 'normal',
        targetRole: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
    },
  });

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createAnnouncementMutation.mutate();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Communication' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Communication Hub</h1>
            <p className="text-muted-foreground mt-1">Announcements and messaging</p>
          </div>
          {canCreateAnnouncement && (
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-announcement">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Announcements</CardTitle>
            </div>
            <CardDescription>School-wide notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <div className="text-center text-muted-foreground p-4">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">No announcements available</div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const contentPreview = announcement.content.length > 150 
                    ? announcement.content.substring(0, 150) + '...' 
                    : announcement.content;
                  const hasMore = announcement.content.length > 150;
                  
                  return (
                    <div key={announcement._id} className="p-4 rounded-lg hover-elevate border" data-testid={`announcement-${announcement._id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            announcement.priority === 'high' ? 'bg-red-500' :
                            announcement.priority === 'normal' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                          <h3 className="font-medium">{announcement.title}</h3>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {announcement.priority || 'normal'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {contentPreview}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>By {announcement.publishedBy?.firstName || 'Admin'}</span>
                          <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
                        </div>
                        {hasMore && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedAnnouncement(announcement)}
                            data-testid={`button-view-announcement-${announcement._id}`}
                          >
                            <Maximize2 className="h-3 w-3 mr-1" />
                            View Full
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Messages</CardTitle>
            </div>
            <CardDescription>Your personal inbox</CardDescription>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <div className="text-center text-muted-foreground p-4">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">No messages available</div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const contentPreview = message.content.length > 100 
                    ? message.content.substring(0, 100) + '...' 
                    : message.content;
                  const hasMore = message.content.length > 100;
                  
                  return (
                    <div key={message._id} className="p-4 rounded-lg hover-elevate border" data-testid={`message-${message._id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!message.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                          <h3 className="font-medium">{message.subject}</h3>
                        </div>
                        {!message.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {contentPreview}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>From {message.senderId?.firstName || 'Unknown'} {message.senderId?.lastName || ''}</span>
                          <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                        {hasMore && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedMessage(message)}
                            data-testid={`button-view-message-${message._id}`}
                          >
                            <Maximize2 className="h-3 w-3 mr-1" />
                            View Full
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full View Dialog for Announcements */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2 w-2 rounded-full ${
                selectedAnnouncement?.priority === 'high' ? 'bg-red-500' :
                selectedAnnouncement?.priority === 'normal' ? 'bg-blue-500' :
                'bg-gray-400'
              }`} />
              <Badge variant="outline" className="text-xs">
                {selectedAnnouncement?.priority || 'normal'}
              </Badge>
            </div>
            <DialogTitle className="text-xl">{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedAnnouncement?.content}
            </p>
            <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
              <span>Published by {selectedAnnouncement?.publishedBy?.firstName || 'Admin'}</span>
              <span>{selectedAnnouncement && new Date(selectedAnnouncement.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full View Dialog for Messages */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {!selectedMessage?.read && (
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl">{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedMessage?.content}
            </p>
            <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
              <span>From {selectedMessage?.senderId?.firstName || 'Unknown'} {selectedMessage?.senderId?.lastName || ''}</span>
              <span>{selectedMessage && new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>Share important information with your school community</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title *</Label>
              <Input
                id="announcement-title"
                placeholder="Enter announcement title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                data-testid="input-announcement-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Content *</Label>
              <Textarea
                id="announcement-content"
                placeholder="Enter announcement details"
                rows={4}
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                data-testid="textarea-announcement-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-priority">Priority</Label>
              <Select 
                value={announcementForm.priority} 
                onValueChange={(value) => setAnnouncementForm({ ...announcementForm, priority: value })}
              >
                <SelectTrigger data-testid="select-announcement-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-target">Target Role (Optional)</Label>
              <Select 
                value={announcementForm.targetRole || undefined} 
                onValueChange={(value) => setAnnouncementForm({ ...announcementForm, targetRole: value })}
              >
                <SelectTrigger data-testid="select-announcement-target">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="principal">Principals</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-announcement">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAnnouncement} 
              disabled={createAnnouncementMutation.isPending}
              data-testid="button-submit-announcement"
            >
              {createAnnouncementMutation.isPending ? 'Creating...' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
