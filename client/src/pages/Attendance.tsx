import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

interface StudentAttendance {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
}

export default function Attendance() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([
    { id: '1', name: 'Sarah Johnson', rollNumber: '15', status: 'present' },
    { id: '2', name: 'Michael Chen', rollNumber: '08', status: 'present' },
    { id: '3', name: 'Emma Williams', rollNumber: '22', status: 'present' },
    { id: '4', name: 'James Brown', rollNumber: '12', status: 'absent' },
    { id: '5', name: 'Olivia Davis', rollNumber: '05', status: 'late' },
    { id: '6', name: 'William Martinez', rollNumber: '18', status: 'present' },
    { id: '7', name: 'Sophia Garcia', rollNumber: '25', status: 'present' },
    { id: '8', name: 'Liam Rodriguez', rollNumber: '03', status: 'present' },
  ]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSave = () => {
    toast({
      title: 'Attendance Saved',
      description: `Attendance for ${selectedClass} on ${format(selectedDate, 'MMM dd, yyyy')} has been saved successfully.`,
    });
  };

  const stats = {
    present: attendanceData.filter(s => s.status === 'present').length,
    absent: attendanceData.filter(s => s.status === 'absent').length,
    late: attendanceData.filter(s => s.status === 'late').length,
    total: attendanceData.length,
  };

  const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'secondary';
      case 'half_day':
        return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Attendance' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Mark and track student attendance</p>
          </div>
          <Button variant="outline" data-testid="button-export-attendance">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance %</p>
                  <p className="text-2xl font-bold">{Math.round((stats.present / stats.total) * 100)}%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-64" data-testid="select-class">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-A">Grade 8-A</SelectItem>
                  <SelectItem value="8-B">Grade 8-B</SelectItem>
                  <SelectItem value="9-A">Grade 9-A</SelectItem>
                  <SelectItem value="9-B">Grade 9-B</SelectItem>
                  <SelectItem value="10-A">Grade 10-A</SelectItem>
                  <SelectItem value="10-B">Grade 10-B</SelectItem>
                  <SelectItem value="11-A">Grade 11-A</SelectItem>
                  <SelectItem value="12-A">Grade 12-A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1">
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full"
                  data-testid="input-date"
                />
              </div>

              <Button onClick={handleSave} data-testid="button-save-attendance">
                <Save className="mr-2 h-4 w-4" />
                Save Attendance
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {attendanceData.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 hover-elevate"
                  data-testid={`attendance-row-${student.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 font-medium text-primary">
                      {student.rollNumber}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {student.rollNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={student.status === 'present' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(student.id, 'present')}
                      data-testid={`button-present-${student.id}`}
                    >
                      Present
                    </Button>
                    <Button
                      variant={student.status === 'absent' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(student.id, 'absent')}
                      data-testid={`button-absent-${student.id}`}
                    >
                      Absent
                    </Button>
                    <Button
                      variant={student.status === 'late' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(student.id, 'late')}
                      data-testid={`button-late-${student.id}`}
                    >
                      Late
                    </Button>
                    <Button
                      variant={student.status === 'half_day' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(student.id, 'half_day')}
                      data-testid={`button-half-day-${student.id}`}
                    >
                      Half Day
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
