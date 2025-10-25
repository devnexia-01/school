import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, FileText, DollarSign, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ParentDashboard() {
  const children = [
    { id: '1', name: 'Sarah Johnson', class: 'Grade 10-A' },
    { id: '2', name: 'Michael Johnson', class: 'Grade 8-B' },
  ];

  const attendanceSummary = {
    thisMonth: 94.2,
    lastMonth: 92.5,
    present: 17,
    absent: 1,
    total: 18,
  };

  const recentResults = [
    { id: '1', exam: 'Mathematics Unit Test 3', marks: '85/100', grade: 'A', percentage: 85 },
    { id: '2', exam: 'Physics Mid-term', marks: '78/100', grade: 'B+', percentage: 78 },
    { id: '3', exam: 'English Literature Essay', marks: '92/100', grade: 'A+', percentage: 92 },
  ];

  const feeStatus = {
    totalAmount: 5000,
    paidAmount: 5000,
    pendingAmount: 0,
    nextDueDate: 'Feb 1, 2025',
    status: 'paid',
  };

  const upcomingEvents = [
    { id: '1', title: 'Parent-Teacher Meeting', date: 'Jan 20, 2025', time: '10:00 AM' },
    { id: '2', title: 'Sports Day', date: 'Jan 25, 2025', time: '09:00 AM' },
    { id: '3', title: 'Science Exhibition', date: 'Feb 5, 2025', time: '11:00 AM' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Parent Dashboard</h1>
          <p className="text-muted-foreground">Monitor your child's academic progress</p>
        </div>
        <Select defaultValue={children[0].id}>
          <SelectTrigger className="w-64" data-testid="select-child">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.name} ({child.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground font-medium">Attendance This Month</p>
                <p className="text-3xl font-bold">{attendanceSummary.thisMonth}%</p>
                <Progress value={attendanceSummary.thisMonth} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {attendanceSummary.present} Present • {attendanceSummary.absent} Absent
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Overall Performance</p>
                <p className="text-3xl font-bold">85%</p>
                <p className="text-xs text-green-600">↑ 3% vs last term</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Fee Status</p>
                <Badge variant="default" className="text-base px-3 py-1">
                  {feeStatus.status === 'paid' ? 'Paid' : 'Pending'}
                </Badge>
                <p className="text-xs text-muted-foreground">Next due: {feeStatus.nextDueDate}</p>
                {feeStatus.status !== 'paid' && (
                  <Button size="sm" className="mt-2 w-full">
                    Pay Now
                  </Button>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Results</CardTitle>
            <CardDescription>Latest academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="p-4 rounded-lg hover-elevate border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{result.exam}</p>
                      <p className="text-sm text-muted-foreground mt-1">Marks: {result.marks}</p>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {result.grade}
                    </Badge>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <CardDescription>Mark your calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover-elevate border">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Messages from teachers and school</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No new messages</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
