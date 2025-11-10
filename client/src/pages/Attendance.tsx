import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

interface StudentAttendance {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
}

interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  rollNumber: string;
  email: string;
  phone: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
}

export default function Attendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);

  const { data: classesData } = useQuery<{ classes: Class[] }>({
    queryKey: ['/api/classes'],
  });

  const { data: studentsData } = useQuery<{ students: Student[] }>({
    queryKey: ['/api/students'],
  });

  const { data: existingAttendanceData } = useQuery<{ attendance: AttendanceRecord[] }>({
    queryKey: [`/api/attendance?classId=${selectedClass}&date=${format(selectedDate, 'yyyy-MM-dd')}`],
    enabled: !!selectedClass && !isStudent,
  });

  const { data: studentAttendanceData, isLoading: studentAttendanceLoading } = useQuery<{ attendance: any[] }>({
    queryKey: ['/api/student/attendance'],
    enabled: isStudent,
  });

  const classes = classesData?.classes || [];
  const allStudents = studentsData?.students || [];
  const existingAttendance = existingAttendanceData?.attendance || [];

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]._id);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (selectedClass && allStudents.length > 0) {
      const selectedClassName = classes.find(c => c._id === selectedClass)?.name;
      
      if (!selectedClassName) {
        setAttendanceData([]);
        return;
      }

      const classStudents = allStudents
        .filter(s => s.class === selectedClassName)
        .map(s => {
          const existingRecord = existingAttendance.find(a => a.studentId === s.id);
          
          return {
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber || 'N/A',
            status: existingRecord?.status || 'present' as AttendanceStatus,
          };
        });
      
      setAttendanceData(classStudents);
    }
  }, [selectedClass, allStudents, classes, existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const attendanceRecords = attendanceData.map(student => ({
        studentId: student.id,
        classId: selectedClass,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: student.status,
      }));

      return await apiRequest('/api/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ attendanceRecords }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/attendance?classId=${selectedClass}&date=${format(selectedDate, 'yyyy-MM-dd')}`] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save attendance',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const updated = prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      );
      return [...updated];
    });
  };

  const handleBulkUpdate = (status: AttendanceStatus) => {
    setAttendanceData(prev =>
      prev.map(student => ({ ...student, status }))
    );
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const escapeCsvField = (field: string): string => {
    if (field == null) return '';
    const str = String(field);
    if (str.match(/^[=+\-@]/)) {
      return `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = () => {
    const csvHeaders = ['Roll Number', 'Student Name', 'Date', 'Status'];
    const csvData = attendanceData.map((student) => [
      escapeCsvField(student.rollNumber),
      escapeCsvField(student.name),
      escapeCsvField(format(selectedDate, 'yyyy-MM-dd')),
      escapeCsvField(student.status)
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = {
    present: attendanceData.filter(s => s.status === 'present').length,
    absent: attendanceData.filter(s => s.status === 'absent').length,
    late: attendanceData.filter(s => s.status === 'late').length,
    half_day: attendanceData.filter(s => s.status === 'half_day').length,
    total: attendanceData.length,
  };

  const attendancePercentage = stats.total > 0
    ? ((stats.present + stats.late + stats.half_day) / stats.total * 100).toFixed(1)
    : '0';

  const studentAttendance = studentAttendanceData?.attendance || [];
  
  const studentStats = {
    present: studentAttendance.filter((a: any) => a.status === 'present').length,
    absent: studentAttendance.filter((a: any) => a.status === 'absent').length,
    late: studentAttendance.filter((a: any) => a.status === 'late').length,
    half_day: studentAttendance.filter((a: any) => a.status === 'half_day').length,
    total: studentAttendance.length,
  };

  const studentAttendancePercentage = studentStats.total > 0
    ? ((studentStats.present + studentStats.late + studentStats.half_day) / studentStats.total * 100).toFixed(1)
    : '0';

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'half_day':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants = {
      present: 'default',
      absent: 'destructive',
      late: 'secondary',
      half_day: 'outline',
    };
    return (
      <Badge variant={variants[status] as any}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isStudent) {
    if (studentAttendanceLoading) {
      return (
        <AppLayout>
          <div className="p-6 space-y-6 max-w-7xl">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </AppLayout>
      );
    }

    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-7xl">
          <Breadcrumb items={[{ label: 'Attendance' }]} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">My Attendance</h1>
              <p className="text-muted-foreground mt-1">View your attendance records and statistics</p>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="text-3xl font-bold" data-testid="stat-student-total">{studentStats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stat-student-present">{studentStats.present}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-3xl font-bold text-red-600" data-testid="stat-student-absent">{studentStats.absent}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-3xl font-bold text-yellow-600" data-testid="stat-student-late">{studentStats.late}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="stat-student-percentage">{studentAttendancePercentage}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Your complete attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              {studentAttendance.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No attendance records</p>
                  <p className="text-sm mt-2">Your attendance records will appear here once they are marked.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full" data-testid="student-attendance-table">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Day</th>
                        <th className="text-center p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentAttendance
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record: any, index: number) => (
                          <tr key={record._id || index} className="border-t hover:bg-muted/50" data-testid={`attendance-record-${index}`}>
                            <td className="p-3 font-medium">
                              {format(new Date(record.date), 'MMM dd, yyyy')}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {format(new Date(record.date), 'EEEE')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusIcon(record.status)}
                                {getStatusBadge(record.status)}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Attendance' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Track daily student attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={attendanceData.length === 0} data-testid="button-export-attendance">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || attendanceData.length === 0} data-testid="button-save-attendance">
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold" data-testid="stat-total">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-3xl font-bold text-green-600" data-testid="stat-present">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-3xl font-bold text-red-600" data-testid="stat-absent">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-3xl font-bold text-yellow-600" data-testid="stat-late">{stats.late}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-3xl font-bold text-blue-600" data-testid="stat-percentage">{attendancePercentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Select class and date to mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        Class {cls.grade} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  data-testid="input-date"
                />
              </div>

              <div className="flex-1 min-w-[200px] flex items-end gap-2">
                <Button variant="outline" onClick={() => handleBulkUpdate('present')} size="sm" data-testid="button-mark-all-present">
                  Mark All Present
                </Button>
                <Button variant="outline" onClick={() => handleBulkUpdate('absent')} size="sm" data-testid="button-mark-all-absent">
                  Mark All Absent
                </Button>
              </div>
            </div>

            {attendanceData.length === 0 && selectedClass && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No students found for this class.</p>
                <p className="text-sm mt-2">Make sure students are assigned to this class in the Students section.</p>
              </div>
            )}

            {attendanceData.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Roll No.</th>
                      <th className="text-left p-3 font-medium">Student Name</th>
                      <th className="text-center p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student) => (
                      <tr key={student.id} className="border-t hover:bg-muted/50" data-testid={`row-student-${student.id}`}>
                        <td className="p-3">{student.rollNumber}</td>
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant={student.status === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              data-testid={`button-present-${student.id}`}
                            >
                              Present
                            </Button>
                            <Button
                              variant={student.status === 'absent' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              data-testid={`button-absent-${student.id}`}
                            >
                              Absent
                            </Button>
                            <Button
                              variant={student.status === 'late' ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student.id, 'late')}
                              data-testid={`button-late-${student.id}`}
                            >
                              Late
                            </Button>
                            <Button
                              variant={student.status === 'half_day' ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student.id, 'half_day')}
                              data-testid={`button-halfday-${student.id}`}
                            >
                              Half Day
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
