import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Timetable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canManageTimetable = user && ['admin', 'principal'].includes(user.role);

  const timetableData: Record<string, Array<{ id: string; period: string; subject: string; teacher: string; room: string }>> = {
    'Monday': [
      { id: '1', period: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Ms. Anderson', room: '201' },
      { id: '2', period: '09:00 - 10:00', subject: 'Physics', teacher: 'Dr. Williams', room: '301' },
      { id: '3', period: '10:00 - 11:00', subject: 'English', teacher: 'Mr. Johnson', room: '101' },
      { id: '4', period: '11:15 - 12:15', subject: 'Computer Science', teacher: 'Mrs. Brown', room: '401' },
      { id: '5', period: '12:15 - 13:15', subject: 'Chemistry', teacher: 'Dr. Williams', room: '302' },
    ],
    'Tuesday': [
      { id: '6', period: '08:00 - 09:00', subject: 'English', teacher: 'Mr. Johnson', room: '101' },
      { id: '7', period: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Ms. Anderson', room: '201' },
      { id: '8', period: '10:00 - 11:00', subject: 'Physical Education', teacher: 'Mr. Davis', room: 'Ground' },
      { id: '9', period: '11:15 - 12:15', subject: 'History', teacher: 'Mrs. Martinez', room: '102' },
      { id: '10', period: '12:15 - 13:15', subject: 'Biology', teacher: 'Dr. Williams', room: '303' },
    ],
    'Wednesday': [
      { id: '11', period: '08:00 - 09:00', subject: 'Computer Science', teacher: 'Mrs. Brown', room: '401' },
      { id: '12', period: '09:00 - 10:00', subject: 'Chemistry', teacher: 'Dr. Williams', room: '302' },
      { id: '13', period: '10:00 - 11:00', subject: 'Mathematics', teacher: 'Ms. Anderson', room: '201' },
      { id: '14', period: '11:15 - 12:15', subject: 'English', teacher: 'Mr. Johnson', room: '101' },
      { id: '15', period: '12:15 - 13:15', subject: 'Geography', teacher: 'Mrs. Martinez', room: '103' },
    ],
    'Thursday': [
      { id: '16', period: '08:00 - 09:00', subject: 'Physics', teacher: 'Dr. Williams', room: '301' },
      { id: '17', period: '09:00 - 10:00', subject: 'English', teacher: 'Mr. Johnson', room: '101' },
      { id: '18', period: '10:00 - 11:00', subject: 'Computer Science', teacher: 'Mrs. Brown', room: '401' },
      { id: '19', period: '11:15 - 12:15', subject: 'Mathematics', teacher: 'Ms. Anderson', room: '201' },
      { id: '20', period: '12:15 - 13:15', subject: 'Art', teacher: 'Ms. Garcia', room: 'Art Room' },
    ],
    'Friday': [
      { id: '21', period: '08:00 - 09:00', subject: 'Biology', teacher: 'Dr. Williams', room: '303' },
      { id: '22', period: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Ms. Anderson', room: '201' },
      { id: '23', period: '10:00 - 11:00', subject: 'English', teacher: 'Mr. Johnson', room: '101' },
      { id: '24', period: '11:15 - 12:15', subject: 'Music', teacher: 'Mr. Thompson', room: 'Music Room' },
      { id: '25', period: '12:15 - 13:15', subject: 'Computer Science', teacher: 'Mrs. Brown', room: '401' },
    ],
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleAddPeriod = () => {
    toast({
      title: 'Period Added',
      description: 'New period has been added to the timetable.',
    });
    setIsAddDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Timetable' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Timetable Management</h1>
            <p className="text-muted-foreground mt-1">View and manage class timetables</p>
          </div>
          {canManageTimetable && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-period">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Period
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Period</DialogTitle>
                  <DialogDescription>Add a new period to the timetable</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <Select>
                      <SelectTrigger data-testid="select-day">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map(day => (
                          <SelectItem key={day} value={day.toLowerCase()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" type="time" data-testid="input-start-time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" type="time" data-testid="input-end-time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select>
                      <SelectTrigger data-testid="select-teacher">
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anderson">Ms. Anderson</SelectItem>
                        <SelectItem value="williams">Dr. Williams</SelectItem>
                        <SelectItem value="johnson">Mr. Johnson</SelectItem>
                        <SelectItem value="brown">Mrs. Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input id="room" placeholder="201" data-testid="input-room" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handleAddPeriod} data-testid="button-save-period">
                    Add Period
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Class Timetable</CardTitle>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48" data-testid="select-class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-A">Grade 10-A</SelectItem>
                  <SelectItem value="10-B">Grade 10-B</SelectItem>
                  <SelectItem value="9-A">Grade 9-A</SelectItem>
                  <SelectItem value="9-B">Grade 9-B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {daysOfWeek.map(day => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">{day}</h3>
                  <div className="space-y-3">
                    {timetableData[day].map((period) => (
                      <div key={period.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <Badge variant="outline" className="min-w-32">{period.period}</Badge>
                          <div className="flex-1">
                            <p className="font-medium">{period.subject}</p>
                            <p className="text-sm text-muted-foreground">{period.teacher} • Room {period.room}</p>
                          </div>
                        </div>
                        {canManageTimetable && (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-period-${period.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-period-${period.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
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
