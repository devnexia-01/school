import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ClipboardCheck, FileText, MessageSquare, Wallet, CalendarDays, BookOpen, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'wouter';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrencyINR } from '@/lib/utils';

export function FacultyDashboard() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  // TODO: Fetch real data from backend APIs
  const todaysClasses: any[] = [];
  const pendingGrading: any[] = [];
  const recentMessages: any[] = [];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Your schedule and teaching activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Classes Today"
          value="4"
          icon={BookOpen}
        />
        <StatCard
          title="Pending Grading"
          value="3"
          icon={FileText}
        />
        <StatCard
          title="Leave Balance"
          value="12 days"
          icon={CalendarDays}
        />
        <StatCard
          title="This Month Salary"
          value={formatCurrencyINR(4800)}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/attendance">
          <Card className="hover-elevate cursor-pointer transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Mark Attendance</p>
                  <p className="text-sm text-muted-foreground">Today's classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/examinations">
          <Card className="hover-elevate cursor-pointer transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Enter Grades</p>
                  <p className="text-sm text-muted-foreground">3 pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payroll">
          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-salary-slip">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Salary Slip</p>
                  <p className="text-sm text-muted-foreground">View & download</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leave-management">
          <Card className="hover-elevate cursor-pointer transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold">Apply Leave</p>
                  <p className="text-sm text-muted-foreground">12 days left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your teaching schedule for today</CardDescription>
            </div>
            <Link href="/timetable">
              <Button variant="outline" size="sm">
                View Full Timetable
              </Button>
            </Link>
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
                    <Button size="sm" variant="outline" data-testid={`button-grade-${item.id}`}>
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
                <div 
                  key={message.id} 
                  className="p-4 rounded-lg hover-elevate border cursor-pointer transition-all"
                  onClick={() => setSelectedMessage(message)}
                  data-testid={`message-${message.id}`}
                >
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

      {/* Full View Dialog for Messages */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-message-detail">
          <DialogHeader>
            <DialogTitle className="text-xl" data-testid="text-message-subject">
              {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">From:</p>
              <p className="text-sm" data-testid="text-message-from">{selectedMessage?.from}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Message:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-message-content">
                {selectedMessage?.subject === 'Question about assignment' && 
                  "Hello, I wanted to ask about the assignment that was given last week. My child is having difficulty understanding the requirements. Could you please provide some additional guidance or clarification? Thank you for your time."}
                {selectedMessage?.subject === 'Faculty meeting reminder' && 
                  "This is a reminder about the upcoming faculty meeting scheduled for tomorrow at 2:00 PM in the conference room. Please review the agenda attached and come prepared with your department updates. Your attendance is mandatory."}
                {selectedMessage?.subject === 'Updated exam schedule' && 
                  "Please note that the exam schedule has been updated. The mid-term examinations will now begin on February 15th instead of February 10th. Please update your records and inform your students accordingly. The detailed schedule is available on the portal."}
              </p>
            </div>
            <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="text-message-time">{selectedMessage?.time}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
