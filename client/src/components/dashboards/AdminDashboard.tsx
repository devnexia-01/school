import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, IndianRupee, AlertCircle, Plus, ClipboardCheck, Send, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { useLocation } from 'wouter';

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    totalFaculty: number;
    monthlyRevenue: number;
    pendingFees: number;
  }>({
    queryKey: ['/api/dashboard/admin/stats'],
  });

  const { data: admissionsData, isLoading: isAdmissionsLoading } = useQuery<{ admissions: Array<any> }>({
    queryKey: ['/api/dashboard/admin/recent-admissions'],
  });

  const { data: feeCollectionTrends, isLoading: isFeeLoading } = useQuery<{ trends: Array<any> }>({
    queryKey: ['/api/dashboard/admin/fee-collection-trends'],
  });

  const { data: activitiesData, isLoading: isActivitiesLoading } = useQuery<{ activities: Array<any> }>({
    queryKey: ['/api/dashboard/admin/recent-activities'],
  });

  const recentAdmissions = admissionsData?.admissions || [];
  const feeCollectionData = feeCollectionTrends?.trends || [];
  const recentActivities = activitiesData?.activities || [];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening in your school today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={isLoading ? '...' : (stats?.totalStudents?.toString() || '0')}
          icon={GraduationCap}
          testId="stat-total-students"
        />
        <StatCard
          title="Total Faculty"
          value={isLoading ? '...' : (stats?.totalFaculty?.toString() || '0')}
          icon={Users}
          testId="stat-total-faculty"
        />
        <StatCard
          title="Monthly Revenue"
          value={isLoading ? '...' : (stats?.monthlyRevenue ? formatCurrencyINR(stats.monthlyRevenue) : formatCurrencyINR(0))}
          icon={IndianRupee}
          testId="stat-monthly-revenue"
        />
        <StatCard
          title="Pending Fees"
          value={isLoading ? '...' : (stats?.pendingFees ? formatCurrencyINR(stats.pendingFees) : formatCurrencyINR(0))}
          icon={AlertCircle}
          testId="stat-pending-fees"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="w-full justify-start gap-2" onClick={() => setLocation('/students/add')} data-testid="button-add-student">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setLocation('/attendance')} data-testid="button-mark-attendance">
          <ClipboardCheck className="h-4 w-4" />
          Mark Attendance
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setLocation('/payroll')} data-testid="button-process-payroll">
          <Briefcase className="h-4 w-4" />
          Process Payroll
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setLocation('/communication')} data-testid="button-send-announcement">
          <Send className="h-4 w-4" />
          Send Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>Latest students enrolled this week</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={recentAdmissions}
              isLoading={isAdmissionsLoading}
              emptyMessage="No recent admissions"
              columns={[
                {
                  key: 'name',
                  header: 'Student Name',
                  cell: (item) => <span className="font-medium">{item.name}</span>,
                },
                {
                  key: 'class',
                  header: 'Class',
                  cell: (item) => <span className="text-sm">{item.class}</span>,
                },
                {
                  key: 'admissionDate',
                  header: 'Date',
                  cell: (item) => <span className="text-sm text-muted-foreground">{item.admissionDate}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  ),
                },
              ]}
              testId="recent-admissions-table"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Trend</CardTitle>
            <CardDescription>Monthly fee collection over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isFeeLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : feeCollectionData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-muted-foreground">No data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={feeCollectionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest activities across the school</CardDescription>
        </CardHeader>
        <CardContent>
          {isActivitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover-elevate border">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">by {activity.user}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
