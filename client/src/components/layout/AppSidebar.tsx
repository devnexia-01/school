import { useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  Building2,
  UserCog,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/lib/auth';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['super_admin', 'admin', 'principal', 'faculty', 'student', 'parent'],
  },
  {
    title: 'Students',
    icon: GraduationCap,
    path: '/students',
    roles: ['admin', 'principal', 'faculty'],
  },
  {
    title: 'Attendance',
    icon: ClipboardCheck,
    path: '/attendance',
    roles: ['admin', 'principal', 'faculty'],
  },
  {
    title: 'Classes & Subjects',
    icon: BookOpen,
    path: '/academics',
    roles: ['admin', 'principal'],
  },
  {
    title: 'Examinations',
    icon: FileText,
    path: '/examinations',
    roles: ['admin', 'principal', 'faculty', 'student', 'parent'],
  },
  {
    title: 'Fee Management',
    icon: DollarSign,
    path: '/fees',
    roles: ['admin', 'principal', 'parent'],
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    path: '/communication',
    roles: ['admin', 'principal', 'faculty', 'student', 'parent'],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">School ERP</h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={item.path}>
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
