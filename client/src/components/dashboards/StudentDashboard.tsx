import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ClipboardCheck, FileText, IndianRupee, Bell, User, Bus, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

export function StudentDashboard() {
  const studentProfile = {
    name: 'Sarah Johnson',
    rollNumber: '15',
    class: 'Grade 10-A',
    section: 'A',
    admissionNumber: 'ADM2024015',
  };

  const todaysTimetable = [
    { id: '1', time: '09:00 AM', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 201' },
    { id: '2', time: '10:30 AM', subject: 'Physics', teacher: 'Ms. Johnson', room: 'Lab 1' },
    { id: '3', time: '12:00 PM', subject: 'English', teacher: 'Mrs. Williams', room: 'Room 105' },
    { id: '4', time: '02:00 PM', subject: 'Chemistry', teacher: 'Dr. Brown', room: 'Lab 2' },
  ];

  const recentResults = [
    { id: '1', exam: 'Mathematics Unit Test 3', marks: '85/100', grade: 'A', date: 'Jan 10, 2025' },
    { id: '2', exam: 'Physics Mid-term', marks: '78/100', grade: 'B+', date: 'Jan 8, 2025' },
    { id: '3', exam: 'English Literature Essay', marks: '92/100', grade: 'A+', date: 'Jan 5, 2025' },
  ];

  const announcements = [
    { id: '1', title: 'Mid-term exam schedule published', date: 'Today', priority: 'high' },
    { id: '2', title: 'Sports day on January 25th', date: 'Yesterday', priority: 'normal' },
    { id: '3', title: 'Library reopening after maintenance', date: '2 days ago', priority: 'low' },
  ];

  const transportInfo = {
    routeName: 'Route A - North Zone',
    busNumber: 'SCH-BUS-01',
    pickupTime: '07:45 AM',
    pickupStop: 'Main Street',
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Student Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{studentProfile.name}</p>
                <p className="text-sm text-muted-foreground">{studentProfile.class}</p>
                <p className="text-xs text-muted-foreground mt-1">Roll No: {studentProfile.rollNumber}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" data-testid="button-view-profile">
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Attendance This Month</p>
                  <p className="text-3xl font-bold">94.2%</p>
                  <Progress value={94.2} className="h-2" />
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
                  <p className="text-sm text-muted-foreground font-medium">Overall GPA</p>
                  <p className="text-3xl font-bold">3.78</p>
                  <p className="text-xs text-green-600">↑ 0.2 vs last term</p>
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
                  <p className="text-lg font-bold text-green-600">Paid</p>
                  <p className="text-xs text-muted-foreground">Next due: Feb 1, 2025</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/timetable">
          <Card className="hover-elevate cursor-pointer transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">View Timetable</p>
                  <p className="text-sm text-muted-foreground">Full schedule</p>
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
                  <BookOpen className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Exam Results</p>
                  <p className="text-sm text-muted-foreground">View all results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fees">
          <Card className="hover-elevate cursor-pointer transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Pay Fees</p>
                  <p className="text-sm text-muted-foreground">Online payment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Timetable</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysTimetable.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 rounded-lg hover-elevate border">
                  <div>
                    <p className="font-medium">{classItem.subject}</p>
                    <p className="text-sm text-muted-foreground">{classItem.teacher} • {classItem.room}</p>
                  </div>
                  <span className="font-mono text-sm font-medium">{classItem.time}</span>
                </div>
              ))}
            </div>
            <Link href="/timetable">
              <Button variant="outline" className="w-full mt-4">
                View Full Timetable
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              <CardTitle>Transport Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-semibold">{transportInfo.routeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bus Number</p>
                <p className="font-semibold">{transportInfo.busNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pickup Stop</p>
                <p className="font-semibold">{transportInfo.pickupStop}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pickup Time</p>
                <p className="font-semibold text-primary">{transportInfo.pickupTime}</p>
              </div>
              <Link href="/transport">
                <Button variant="outline" className="w-full" size="sm">
                  View Transport Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Results</CardTitle>
            <CardDescription>Your latest academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="p-3 rounded-lg hover-elevate border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{result.exam}</p>
                    <Badge variant="outline">{result.grade}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{result.marks}</span>
                    <span className="text-xs text-muted-foreground">{result.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/examinations">
              <Button variant="outline" className="w-full mt-4">
                View All Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Announcements</CardTitle>
            </div>
            <CardDescription>Important updates from school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-center justify-between p-3 rounded-lg hover-elevate border">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${announcement.priority === 'high' ? 'bg-red-500' : announcement.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground">{announcement.date}</p>
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
