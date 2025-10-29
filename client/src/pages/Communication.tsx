import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

export default function Communication() {
  const { user } = useAuth();
  const canCreateAnnouncement = user && ['admin', 'principal'].includes(user.role);

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery<{ announcements: Array<any> }>({
    queryKey: ['/api/announcements'],
  });

  const announcements = announcementsData?.announcements || [];

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
            <Button data-testid="button-create-announcement">
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
                {announcements.map((announcement) => (
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
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By {announcement.publishedBy?.firstName || 'Admin'}</span>
                      <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
