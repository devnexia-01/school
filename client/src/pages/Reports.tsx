import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, Users, GraduationCap, DollarSign, BookOpen, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Reports() {
  const { user } = useAuth();

  const attendanceData = [
    { month: 'Jan', present: 92, absent: 8 },
    { month: 'Feb', present: 90, absent: 10 },
    { month: 'Mar', present: 94, absent: 6 },
    { month: 'Apr', present: 88, absent: 12 },
    { month: 'May', present: 91, absent: 9 },
    { month: 'Jun', present: 93, absent: 7 },
  ];

  const performanceData = [
    { subject: 'Math', average: 85 },
    { subject: 'Science', average: 78 },
    { subject: 'English', average: 82 },
    { subject: 'History', average: 76 },
    { subject: 'Computer', average: 88 },
  ];

  const feeCollectionData = [
    { month: 'Jan', collected: 45000, pending: 15000 },
    { month: 'Feb', collected: 48000, pending: 12000 },
    { month: 'Mar', collected: 52000, pending: 8000 },
    { month: 'Apr', collected: 50000, pending: 10000 },
    { month: 'May', collected: 55000, pending: 5000 },
    { month: 'Jun', collected: 58000, pending: 2000 },
  ];

  const classDistribution = [
    { name: 'Grade 8', value: 120 },
    { name: 'Grade 9', value: 135 },
    { name: 'Grade 10', value: 142 },
    { name: 'Grade 11', value: 118 },
    { name: 'Grade 12', value: 95 },
  ];

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
            <Button variant="outline" data-testid="button-export-report">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value="610"
            icon={GraduationCap}
            trend={{ value: 8.2, label: 'vs last year', isPositive: true }}
          />
          <StatCard
            title="Faculty Members"
            value="45"
            icon={Users}
            trend={{ value: 12.5, label: 'vs last year', isPositive: true }}
          />
          <StatCard
            title="Avg. Attendance"
            value="92.3%"
            icon={ClipboardCheck}
            trend={{ value: 2.1, label: 'vs last month', isPositive: true }}
          />
          <StatCard
            title="Fee Collection"
            value="95.8%"
            icon={DollarSign}
            trend={{ value: 4.3, label: 'vs last month', isPositive: true }}
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
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {classDistribution.map((entry, index) => (
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
                    <Bar dataKey="collected" fill="#10b981" name="Collected ($)" />
                    <Bar dataKey="pending" fill="#ef4444" name="Pending ($)" />
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
                      <span className="font-bold text-green-600">$308,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Collected</span>
                      <span className="font-bold">$295,200</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-bold text-orange-600">$12,800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Salaries</span>
                      <span className="font-bold">$180,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Infrastructure</span>
                      <span className="font-bold">$45,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Utilities</span>
                      <span className="font-bold">$18,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">$65,200</p>
                      <p className="text-sm text-muted-foreground mt-2">This Quarter</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">15.3% increase</span>
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
