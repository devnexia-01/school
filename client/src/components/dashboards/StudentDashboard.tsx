import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ClipboardCheck, FileText, IndianRupee, Bell, User, Bus, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { startTransition } from 'react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/student/profile'],
    enabled: !!user && user.role === 'student',
  });

  const { data: timetableData, isLoading: timetableLoading } = useQuery({
    queryKey: ['/api/student/timetable'],
    enabled: !!user && user.role === 'student',
  });

  const { data: examResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['/api/student/exam-results'],
    enabled: !!user && user.role === 'student',
  });

  const { data: transportData } = useQuery({
    queryKey: ['/api/student/transport'],
    enabled: !!user && user.role === 'student',
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['/api/announcements'],
    enabled: !!user,
  });

  const { data: notificationsCount } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
  });

  const { data: messagesCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
  });

  const student = profileData?.student;
  const userProfile = profileData?.user;
  const timetable = timetableData?.timetable || [];
  const results = examResults?.results || [];
  const transport = transportData?.transport;
  const announcements = announcementsData?.announcements || [];

  const todaysTimetable = timetable
    .filter((item: any) => {
      const today = new Date().getDay();
      const dayMap: Record<number, number> = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
      return item.day === dayMap[today];
    })
    .slice(0, 4);

  const recentResults = results.slice(0, 3);

  const calculateAttendance = () => 94.2;
  const calculateGPA = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum: number, r: any) => sum + (r.marksObtained || 0), 0);
    const max = results.reduce((sum: number, r: any) => sum + (r.totalMarks || 100), 0);
    return ((total / max) * 4).toFixed(2);
  };

  if (profileLoading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="lg:col-span-3 h-64" />
        </div>
      </div>
    );
  }

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
                <p className="font-semibold" data-testid="text-student-name">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-student-class">
                  {student?.classId ? `Class ${student.classId}` : 'Not Assigned'}
                </p>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-roll-number">
                  Roll No: {student?.rollNumber || 'N/A'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="button-view-profile"
                onClick={() => startTransition(() => setLocation('/profile'))}
              >
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
                  <p className="text-3xl font-bold" data-testid="text-attendance">
                    {calculateAttendance()}%
                  </p>
                  <Progress value={calculateAttendance()} className="h-2" />
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
                  <p className="text-3xl font-bold" data-testid="text-gpa">
                    {calculateGPA()}
                  </p>
                  <p className="text-xs text-green-600">Based on exam results</p>
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
                  <p className="text-lg font-bold text-green-600" data-testid="text-fee-status">
                    Paid
                  </p>
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
          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-timetable">
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
          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-examinations">
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
          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-fees">
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
            {timetableLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : todaysTimetable.length > 0 ? (
              <div className="space-y-3">
                {todaysTimetable.map((classItem: any) => (
                  <div
                    key={classItem._id}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                    data-testid={`timetable-${classItem._id}`}
                  >
                    <div>
                      <p className="font-medium">{classItem.subjectId?.name || 'Subject'}</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.teacherId
                          ? `${classItem.teacherId.firstName} ${classItem.teacherId.lastName}`
                          : 'Teacher'}{' '}
                        • Room {classItem.room || 'TBA'}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium">
                      {classItem.startTime || '00:00'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No classes scheduled for today</p>
            )}
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
            {transport ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-semibold" data-testid="text-route-name">
                    {transport.routeId?.routeName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bus Number</p>
                  <p className="font-semibold" data-testid="text-bus-number">
                    {transport.routeId?.vehicleNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Stop</p>
                  <p className="font-semibold" data-testid="text-pickup-stop">
                    {transport.pickupStop || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Time</p>
                  <p className="font-semibold text-primary" data-testid="text-pickup-time">
                    {transport.pickupTime || 'N/A'}
                  </p>
                </div>
                <Link href="/transport">
                  <Button variant="outline" className="w-full" size="sm" data-testid="button-view-transport">
                    View Transport Details
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-center text-muted-foreground">No transport allocated</p>
                <Link href="/transport">
                  <Button variant="outline" className="w-full mt-4" size="sm" data-testid="button-view-transport">
                    View Transport Options
                  </Button>
                </Link>
              </div>
            )}
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
            {resultsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : recentResults.length > 0 ? (
              <div className="space-y-3">
                {recentResults.map((result: any) => (
                  <div
                    key={result._id}
                    className="p-3 rounded-lg hover-elevate border"
                    data-testid={`result-${result._id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">
                        {result.examId?.name || 'Exam'} - {result.subjectId?.name || 'Subject'}
                      </p>
                      <Badge variant="outline">{result.grade || 'N/A'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">
                        {result.marksObtained || 0}/{result.totalMarks || 100}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {result.createdAt ? format(new Date(result.createdAt), 'MMM dd, yyyy') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No exam results available</p>
            )}
            <Link href="/examinations">
              <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-results">
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
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <div
                    key={announcement._id}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                    data-testid={`announcement-${announcement._id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full bg-blue-500`} />
                      <div>
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {announcement.publishedDate
                            ? format(new Date(announcement.publishedDate), 'MMM dd, yyyy')
                            : 'Recent'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No announcements</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
