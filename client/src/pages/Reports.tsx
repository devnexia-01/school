import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, Users, GraduationCap, IndianRupee, BookOpen, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrencyINR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function Reports() {
  const { user } = useAuth();

  const exportReport = () => {
    const csvData = [];
    
    csvData.push(['School ERP - Comprehensive Report']);
    csvData.push(['']);
    csvData.push(['Overview Statistics']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Students', stats?.totalStudents || 0]);
    csvData.push(['Faculty Members', stats?.totalFaculty || 0]);
    csvData.push(['Monthly Revenue', stats?.monthlyRevenue || 0]);
    csvData.push(['Pending Fees', stats?.pendingFees || 0]);
    csvData.push(['']);
    
    if (attendanceData.length > 0) {
      csvData.push(['Attendance Trends']);
      csvData.push(['Month', 'Present %', 'Absent %']);
      attendanceData.forEach((row: any) => {
        csvData.push([row.month, row.present, row.absent]);
      });
      csvData.push(['']);
    }
    
    if (performanceData.length > 0) {
      csvData.push(['Academic Performance']);
      csvData.push(['Subject', 'Average Score']);
      performanceData.forEach((row: any) => {
        csvData.push([row.subject, row.average]);
      });
      csvData.push(['']);
    }
    
    if (classDistribution.length > 0) {
      csvData.push(['Class Distribution']);
      csvData.push(['Grade', 'Students']);
      classDistribution.forEach((row: any) => {
        csvData.push([row.name, row.value]);
      });
      csvData.push(['']);
    }
    
    if (feeCollectionData.length > 0) {
      csvData.push(['Fee Collection Trends']);
      csvData.push(['Month', 'Collected', 'Pending']);
      feeCollectionData.forEach((row: any) => {
        csvData.push([row.month, row.collected, row.pending]);
      });
      csvData.push(['']);
      csvData.push(['Fee Summary']);
      csvData.push(['Total Revenue', feeStats.totalRevenue]);
      csvData.push(['Collected', feeStats.collected]);
      csvData.push(['Pending', feeStats.pending]);
    }
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data: stats } = useQuery<{
    totalStudents: number;
    totalFaculty: number;
    monthlyRevenue: number;
    pendingFees: number;
  }>({
    queryKey: ['/api/dashboard/admin/stats'],
  });

  const { data: attendanceResponse, isLoading: isAttendanceLoading } = useQuery<{ data: Array<any> }>({
    queryKey: ['/api/reports/attendance'],
  });

  const { data: performanceResponse, isLoading: isPerformanceLoading } = useQuery<{ data: Array<any> }>({
    queryKey: ['/api/reports/performance'],
  });

  const { data: classDistResponse, isLoading: isClassDistLoading } = useQuery<{ data: Array<any> }>({
    queryKey: ['/api/reports/class-distribution'],
  });

  const { data: feeCollectionResponse, isLoading: isFeeCollectionLoading } = useQuery<{
    trends: Array<any>;
    totalRevenue: number;
    collected: number;
    pending: number;
  }>({
    queryKey: ['/api/reports/fee-collection'],
  });

  const attendanceData = attendanceResponse?.data || [];
  const performanceData = performanceResponse?.data || [];
  const classDistribution = classDistResponse?.data || [];
  const feeCollectionData = feeCollectionResponse?.trends || [];
  const feeStats = {
    totalRevenue: feeCollectionResponse?.totalRevenue || 0,
    collected: feeCollectionResponse?.collected || 0,
    pending: feeCollectionResponse?.pending || 0,
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Reports & Analytics' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive insights and data analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="2024-2025">
              <SelectTrigger className="w-48" data-testid="select-academic-year">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport} data-testid="button-export-report">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents?.toString() || '0'}
            icon={GraduationCap}
          />
          <StatCard
            title="Faculty Members"
            value={stats?.totalFaculty?.toString() || '0'}
            icon={Users}
          />
          <StatCard
            title="Avg. Attendance"
            value={attendanceData.length > 0 ? `${Math.round(attendanceData.reduce((sum: number, d: any) => sum + d.present, 0) / attendanceData.length)}%` : '0%'}
            icon={ClipboardCheck}
          />
          <StatCard
            title="Monthly Revenue"
            value={stats?.monthlyRevenue ? formatCurrencyINR(stats.monthlyRevenue) : formatCurrencyINR(0)}
            icon={IndianRupee}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="academic" data-testid="tab-academic">Academic Performance</TabsTrigger>
            <TabsTrigger value="attendance" data-testid="tab-attendance">Attendance</TabsTrigger>
            <TabsTrigger value="financial" data-testid="tab-financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Distribution</CardTitle>
                  <CardDescription>Number of students per grade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={classDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Attendance Trend</CardTitle>
                  <CardDescription>Student attendance percentage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#10b981" name="Present %" />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Average Performance</CardTitle>
                <CardDescription>Average marks across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#3b82f6" name="Average Marks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Grade 10-A</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">95.2%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Michael Chen</p>
                        <p className="text-sm text-muted-foreground">Grade 10-A</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">94.8%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Emma Williams</p>
                        <p className="text-sm text-muted-foreground">Grade 9-B</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">93.5%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Overall</span>
                      <span className="font-bold text-green-600">94.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Grade 12</span>
                      <span className="font-bold text-green-600">96.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Grade 11</span>
                      <span className="font-bold text-green-600">93.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Grade 10</span>
                      <span className="font-bold text-green-600">94.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>This Quarter</span>
                      <span className="font-bold text-green-600">↑ 2.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Quarter</span>
                      <span className="font-bold">87.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Year Average</span>
                      <span className="font-bold">85.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>Monthly attendance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#10b981" name="Present %" />
                    <Bar dataKey="absent" fill="#ef4444" name="Absent %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Trends</CardTitle>
                <CardDescription>Monthly fee collection and pending amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={feeCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="collected" fill="#10b981" name="Collected (₹)" />
                    <Bar dataKey="pending" fill="#ef4444" name="Pending (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold text-green-600">{formatCurrencyINR(feeStats.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Collected</span>
                      <span className="font-bold">{formatCurrencyINR(feeStats.collected)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-orange-600">{formatCurrencyINR(feeStats.pending)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Collection Rate</span>
                      <span className="font-bold text-green-600">
                        {feeStats.totalRevenue > 0 
                          ? `${Math.round((feeStats.collected / feeStats.totalRevenue) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending Rate</span>
                      <span className="font-bold text-orange-600">
                        {feeStats.totalRevenue > 0 
                          ? `${Math.round((feeStats.pending / feeStats.totalRevenue) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">{formatCurrencyINR(feeStats.collected)}</p>
                      <p className="text-sm text-muted-foreground mt-2">Total Collected Fees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
