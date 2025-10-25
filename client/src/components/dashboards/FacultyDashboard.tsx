import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ClipboardCheck, FileText, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function FacultyDashboard() {
  const todaysClasses = [
    { id: '1', time: '09:00 AM', class: 'Grade 10-A', subject: 'Mathematics', room: 'Room 201', status: 'upcoming' },
    { id: '2', time: '10:30 AM', class: 'Grade 9-B', subject: 'Mathematics', room: 'Room 201', status: 'upcoming' },
    { id: '3', time: '01:00 PM', class: 'Grade 11-A', subject: 'Statistics', room: 'Room 305', status: 'upcoming' },
    { id: '4', time: '02:30 PM', class: 'Grade 12-A', subject: 'Calculus', room: 'Room 201', status: 'upcoming' },
  ];

  const pendingGrading = [
    { id: '1', assignment: 'Chapter 5 Quiz', class: 'Grade 10-A', submitted: 42, total: 45, dueDate: 'Today' },
    { id: '2', assignment: 'Mid-term Exam', class: 'Grade 11-A', submitted: 38, total: 40, dueDate: 'Tomorrow' },
    { id: '3', assignment: 'Homework Assignment 12', class: 'Grade 9-B', submitted: 35, total: 38, dueDate: 'Jan 18' },
  ];

  const recentMessages = [
    { id: '1', from: 'Mrs. Johnson (Parent)', subject: 'Question about assignment', time: '2 hours ago' },
    { id: '2', from: 'Principal', subject: 'Faculty meeting reminder', time: '5 hours ago' },
    { id: '3', from: 'Admin', subject: 'Updated exam schedule', time: '1 day ago' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Your schedule and teaching activities</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your teaching schedule for today</CardDescription>
            </div>
            <Button data-testid="button-mark-attendance">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaysClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 rounded-lg hover-elevate border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{classItem.subject} - {classItem.class}</p>
                    <p className="text-sm text-muted-foreground">{classItem.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{classItem.time}</span>
                  <Badge>{classItem.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Grading</CardTitle>
            <CardDescription>Assignments waiting for evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingGrading.map((item) => (
                <div key={item.id} className="p-4 rounded-lg hover-elevate border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.assignment}</p>
                      <p className="text-sm text-muted-foreground">{item.class}</p>
                    </div>
                    <Badge variant="secondary">{item.dueDate}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-muted-foreground">
                      {item.submitted}/{item.total} submitted
                    </span>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Grade Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Recent communication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-4 rounded-lg hover-elevate border cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{message.from}</p>
                      <p className="text-sm text-muted-foreground">{message.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
