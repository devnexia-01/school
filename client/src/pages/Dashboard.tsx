import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { PrincipalDashboard } from '@/components/dashboards/PrincipalDashboard';
import { FacultyDashboard } from '@/components/dashboards/FacultyDashboard';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import { ParentDashboard } from '@/components/dashboards/ParentDashboard';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'principal':
        return <PrincipalDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
}
