import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, IndianRupee, AlertCircle, Plus, ClipboardCheck, Send, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/admin/stats'],
  });

  const recentAdmissions = [
    { id: '1', name: 'Sarah Johnson', class: 'Grade 10-A', admissionDate: '2025-01-15', status: 'active' },
    { id: '2', name: 'Michael Chen', class: 'Grade 9-B', admissionDate: '2025-01-14', status: 'active' },
    { id: '3', name: 'Emma Williams', class: 'Grade 11-A', admissionDate: '2025-01-14', status: 'active' },
    { id: '4', name: 'James Brown', class: 'Grade 8-C', admissionDate: '2025-01-13', status: 'pending' },
    { id: '5', name: 'Olivia Davis', class: 'Grade 12-A', admissionDate: '2025-01-12', status: 'active' },
  ];

  const feeCollectionData = [
    { month: 'Aug', amount: 45000 },
    { month: 'Sep', amount: 52000 },
    { month: 'Oct', amount: 48000 },
    { month: 'Nov', amount: 55000 },
    { month: 'Dec', amount: 58000 },
    { month: 'Jan', amount: 62000 },
  ];

  const recentActivities = [
    { id: '1', action: 'New student admitted', user: 'Admin', time: '2 hours ago' },
    { id: '2', action: 'Fee payment received', user: 'Sarah Johnson', time: '3 hours ago' },
    { id: '3', action: 'Exam schedule published', user: 'Principal', time: '5 hours ago' },
    { id: '4', action: 'Attendance marked', user: 'Ms. Anderson', time: '6 hours ago' },
    { id: '5', action: 'New announcement posted', user: 'Admin', time: '1 day ago' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening in your school today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={isLoading ? '...' : stats?.totalStudents || 1248}
          icon={GraduationCap}
          trend={{ value: 5.2, label: 'vs last month', isPositive: true }}
          testId="stat-total-students"
        />
        <StatCard
          title="Total Faculty"
          value={isLoading ? '...' : stats?.totalFaculty || 87}
          icon={Users}
          trend={{ value: 2.1, label: 'vs last month', isPositive: true }}
          testId="stat-total-faculty"
        />
        <StatCard
          title="Monthly Revenue"
          value={isLoading ? '...' : stats?.monthlyRevenue || formatCurrencyINR(62450)}
          icon={IndianRupee}
          trend={{ value: 8.3, label: 'vs last month', isPositive: true }}
          testId="stat-monthly-revenue"
        />
        <StatCard
          title="Pending Fees"
          value={isLoading ? '...' : stats?.pendingFees || formatCurrencyINR(8230)}
          icon={AlertCircle}
          trend={{ value: 3.2, label: 'vs last month', isPositive: false }}
          testId="stat-pending-fees"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="w-full justify-start gap-2" data-testid="button-add-student">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-mark-attendance">
          <ClipboardCheck className="h-4 w-4" />
          Mark Attendance
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-process-payroll">
          <Briefcase className="h-4 w-4" />
          Process Payroll
        </Button>
        <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-send-announcement">
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest activities across the school</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
