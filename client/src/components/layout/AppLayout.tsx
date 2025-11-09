import { ReactNode, useState, startTransition, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { clearTenantContext } from '@/lib/queryClient';

interface AppLayoutProps {
  children: ReactNode;
}

function getTenantIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const urlTenantId = params.get('tenantId');
  return urlTenantId || sessionStorage.getItem('superadmin_viewing_tenant');
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(getTenantIdFromStorage);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTenantId = getTenantIdFromStorage();
      setViewingTenantId(prev => prev !== currentTenantId ? currentTenantId : prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setViewingTenantId(getTenantIdFromStorage());
  }, [location]);

  const { data: viewingTenantData } = useQuery<{ tenant: any; stats: any }>({
    queryKey: ['/api/tenants', viewingTenantId],
    enabled: !!viewingTenantId && user?.role === 'super_admin',
  });

  const { data: notificationsData } = useQuery<{ notifications: any[] }>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const { data: notificationsCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsCount?.count || 0;

  const handleExitTenantView = () => {
    clearTenantContext();
    setViewingTenantId(null);
    startTransition(() => setLocation('/dashboard'));
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: 'Search',
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const style = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              
              <form onSubmit={handleSearch} className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students, classes, subjects..."
                  className="pl-9 w-full"
                  data-testid="input-global-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-notifications" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification: any) => (
                        <DropdownMenuItem 
                          key={notification._id}
                          data-testid={`item-notification-${notification._id}`}
                          onClick={() => startTransition(() => setLocation('/communication'))}
                          className="flex flex-col items-start py-3 cursor-pointer"
                        >
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => startTransition(() => setLocation('/communication'))}
                        data-testid="button-view-all-notifications"
                        className="text-center text-sm text-primary"
                      >
                        View All Notifications
                      </DropdownMenuItem>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
                      No notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.firstName[0]}{user?.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => startTransition(() => setLocation('/profile'))} data-testid="button-profile">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {viewingTenantId && user?.role === 'super_admin' && (
            <div className="flex items-center justify-between gap-4 bg-primary px-6 py-3 text-primary-foreground" data-testid="banner-tenant-context">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary-foreground text-primary">
                  Viewing School
                </Badge>
                <span className="font-medium">
                  {viewingTenantData?.tenant?.name || 'Loading...'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExitTenantView}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                data-testid="button-exit-tenant-view"
              >
                <X className="h-4 w-4 mr-1" />
                Exit School View
              </Button>
            </div>
          )}

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
