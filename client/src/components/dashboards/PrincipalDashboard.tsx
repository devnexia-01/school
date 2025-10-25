import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ClipboardCheck, GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar } from 'recharts';

export function PrincipalDashboard() {
  const attendanceData = [
    { month: 'Aug', percentage: 92 },
    { month: 'Sep', percentage: 89 },
    { month: 'Oct', percentage: 94 },
    { month: 'Nov', percentage: 91 },
    { month: 'Dec', percentage: 88 },
    { month: 'Jan', percentage: 93 },
  ];

  const classPerformanceData = [
    { class: '8th', average: 78 },
    { class: '9th', average: 82 },
    { class: '10th', average: 75 },
    { class: '11th', average: 88 },
    { class: '12th', average: 85 },
  ];

  const pendingApprovals = [
    { id: '1', type: 'Leave Request', from: 'Ms. Anderson', date: 'Today', priority: 'high' },
    { id: '2', type: 'Expense Approval', from: 'Accounts Dept', date: 'Today', priority: 'medium' },
    { id: '3', type: 'Admission Request', from: 'Emma Williams', date: 'Yesterday', priority: 'high' },
    { id: '4', type: 'Curriculum Change', from: 'Mr. Thompson', date: '2 days ago', priority: 'low' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Principal Dashboard</h1>
        <p className="text-muted-foreground">Strategic overview and key performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Attendance"
          value="93.2%"
          icon={ClipboardCheck}
          trend={{ value: 2.3, label: 'vs last month', isPositive: true }}
          testId="stat-attendance"
        />
        <StatCard
          title="Exam Performance"
          value="82.5%"
          icon={BarChart}
          trend={{ value: 4.1, label: 'vs last term', isPositive: true }}
          testId="stat-exam-performance"
        />
        <StatCard
          title="Faculty Count"
          value="87"
          icon={Users}
          testId="stat-faculty-count"
        />
        <StatCard
          title="Pending Approvals"
          value="12"
          icon={CheckCircle2}
          testId="stat-pending-approvals"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance percentage over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-wise Performance</CardTitle>
            <CardDescription>Average exam scores by grade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="class" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--primary))" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 rounded-lg hover-elevate border">
                <div className="space-y-1">
                  <p className="font-medium">{approval.type}</p>
                  <p className="text-sm text-muted-foreground">From: {approval.from}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={approval.priority === 'high' ? 'destructive' : approval.priority === 'medium' ? 'default' : 'secondary'}>
                    {approval.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{approval.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
