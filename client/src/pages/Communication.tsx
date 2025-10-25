import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bell, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Communication() {
  const announcements = [
    { id: '1', title: 'Mid-term exam schedule published', content: 'The schedule for mid-term examinations has been published. Please check the timetable section.', date: '2025-01-15', priority: 'high', author: 'Principal' },
    { id: '2', title: 'Sports day on January 25th', content: 'Annual sports day will be held on January 25th. All students are requested to participate.', date: '2025-01-14', priority: 'normal', author: 'Sports Coordinator' },
    { id: '3', title: 'Library reopening after maintenance', content: 'The school library will reopen on January 18th after scheduled maintenance work.', date: '2025-01-12', priority: 'low', author: 'Librarian' },
  ];

  const messages = [
    { id: '1', from: 'Mrs. Johnson (Parent)', subject: 'Question about homework assignment', preview: 'I have a question regarding the mathematics homework...', time: '2 hours ago', unread: true },
    { id: '2', from: 'Principal', subject: 'Faculty meeting on Monday', preview: 'There will be a faculty meeting on Monday at 10 AM...', time: '5 hours ago', unread: true },
    { id: '3', from: 'Admin', subject: 'Updated exam schedule', preview: 'Please find attached the updated examination schedule...', time: '1 day ago', unread: false },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Communication' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Communication Hub</h1>
            <p className="text-muted-foreground mt-1">Announcements and messaging</p>
          </div>
          <Button data-testid="button-create-announcement">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Announcements</CardTitle>
              </div>
              <CardDescription>School-wide notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg hover-elevate border" data-testid={`announcement-${announcement.id}`}>
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
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Messages</CardTitle>
                </div>
                <Button size="sm" variant="outline" data-testid="button-compose-message">
                  Compose
                </Button>
              </div>
              <CardDescription>Your conversations and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg hover-elevate border cursor-pointer ${message.unread ? 'bg-primary/5 border-primary/20' : ''}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{message.from}</p>
                          {message.unread && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {message.preview}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{message.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
