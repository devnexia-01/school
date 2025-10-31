import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

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
    queryKey: ['/api/attendance', selectedClass, format(selectedDate, 'yyyy-MM-dd')],
    enabled: !!selectedClass,
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
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
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
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleBulkUpdate = (status: AttendanceStatus) => {
    setAttendanceData(prev =>
      prev.map(student => ({ ...student, status }))
    );
  };

  const handleSave = () => {
    saveMutation.mutate();
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Attendance' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Track daily student attendance</p>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending || attendanceData.length === 0} data-testid="button-save-attendance">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
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
