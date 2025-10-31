import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface TimetableEntry {
  _id: string;
  classId: {
    _id: string;
    name: string;
    grade: number;
    section: string;
  };
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  academicYear: string;
}

interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

const DAYS_MAP: { [key: string]: string } = {
  monday: 'MONDAY',
  tuesday: 'TUESDAY',
  wednesday: 'WEDNESDAY',
  thursday: 'THURSDAY',
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
};

const COLORS = [
  'bg-blue-500 dark:bg-blue-600',
  'bg-teal-500 dark:bg-teal-600',
  'bg-purple-500 dark:bg-purple-600',
  'bg-green-500 dark:bg-green-600',
  'bg-orange-500 dark:bg-orange-600',
  'bg-pink-500 dark:bg-pink-600',
];

const timetableSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], {
    errorMap: () => ({ message: 'Please select a valid day of the week' }),
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  roomNumber: z.string().optional(),
  academicYear: z.string().min(4, 'Academic year is required'),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return startMinutes < endMinutes;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type TimetableFormData = z.infer<typeof timetableSchema>;

function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  const hours = totalMinutes / 60;
  return `${hours.toFixed(1)} hours`;
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export default function Timetable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const canManage = user?.role === 'admin' || user?.role === 'principal' || user?.role === 'super_admin';

  const { data: classesData } = useQuery<{ classes: Class[] }>({
    queryKey: ['/api/classes'],
    enabled: user?.role !== 'student',
  });

  const { data: subjectsData } = useQuery<{ subjects: Subject[] }>({
    queryKey: ['/api/subjects'],
    enabled: canManage,
  });

  const { data: teachersData } = useQuery<{ users: Teacher[] }>({
    queryKey: ['/api/users?role=faculty'],
    enabled: canManage,
  });

  const { data: timetableData, isLoading } = useQuery<{ timetable: TimetableEntry[] }>({
    queryKey: user?.role === 'student' 
      ? ['/api/student/timetable'] 
      : ['/api/timetable', selectedClass],
    enabled: user?.role === 'student' || !!selectedClass,
  });

  const classes = classesData?.classes || [];
  const subjects = subjectsData?.subjects || [];
  const teachers = teachersData?.users || [];
  const timetable = timetableData?.timetable || [];

  const form = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      classId: '',
      subjectId: '',
      teacherId: '',
      dayOfWeek: undefined as any,
      startTime: '',
      endTime: '',
      roomNumber: '',
      academicYear: new Date().getFullYear().toString(),
    },
  });

  useEffect(() => {
    if (classes.length > 0 && !selectedClass && user?.role !== 'student') {
      setSelectedClass(classes[0]._id);
    }
  }, [classes, selectedClass, user]);

  useEffect(() => {
    if (editingEntry) {
      form.reset({
        classId: editingEntry.classId._id,
        subjectId: editingEntry.subjectId._id,
        teacherId: editingEntry.teacherId._id,
        dayOfWeek: editingEntry.dayOfWeek as any,
        startTime: editingEntry.startTime,
        endTime: editingEntry.endTime,
        roomNumber: editingEntry.roomNumber || '',
        academicYear: editingEntry.academicYear,
      });
    } else {
      form.reset({
        classId: selectedClass,
        subjectId: '',
        teacherId: '',
        dayOfWeek: undefined as any,
        startTime: '',
        endTime: '',
        roomNumber: '',
        academicYear: new Date().getFullYear().toString(),
      });
    }
  }, [editingEntry, form, selectedClass]);

  const createMutation = useMutation({
    mutationFn: (data: TimetableFormData) => 
      apiRequest('/api/timetable', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({ title: 'Success', description: 'Timetable entry created successfully' });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create timetable entry',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimetableFormData }) => 
      apiRequest(`/api/timetable/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({ title: 'Success', description: 'Timetable entry updated successfully' });
      setIsDialogOpen(false);
      setEditingEntry(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update timetable entry',
        variant: 'destructive'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/timetable/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({ title: 'Success', description: 'Timetable entry deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete timetable entry',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: TimetableFormData) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    form.reset({
      classId: selectedClass,
      subjectId: '',
      teacherId: '',
      dayOfWeek: undefined as any,
      startTime: '',
      endTime: '',
      roomNumber: '',
      academicYear: new Date().getFullYear().toString(),
    });
    setIsDialogOpen(true);
  };

  const groupedByDay = timetable.reduce((acc, entry) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as { [key: string]: TimetableEntry[] });

  const daysToShow = Object.keys(DAYS_MAP).filter(day => groupedByDay[day] && groupedByDay[day].length > 0);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Time Table' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Time Table</h1>
            <p className="text-muted-foreground mt-1">Weekly schedule at a glance</p>
          </div>
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>

        {user?.role !== 'student' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <label className="text-sm font-medium">Select Class:</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[250px]" data-testid="select-class">
                      <SelectValue placeholder="Select a class" />
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
                {canManage && selectedClass && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNew} data-testid="button-add-timetable">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="classId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-form-class">
                                      <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {classes.map((cls) => (
                                      <SelectItem key={cls._id} value={cls._id}>
                                        Class {cls.grade} {cls.section}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="subjectId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-subject">
                                      <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjects.map((subject) => (
                                      <SelectItem key={subject._id} value={subject._id}>
                                        {subject.name} ({subject.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="teacherId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teacher</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-teacher">
                                      <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {teachers.map((teacher) => (
                                      <SelectItem key={teacher._id} value={teacher._id}>
                                        {teacher.firstName} {teacher.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dayOfWeek"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day of Week</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-day">
                                      <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.keys(DAYS_MAP).map((day) => (
                                      <SelectItem key={day} value={day}>
                                        {DAYS_MAP[day]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} data-testid="input-start-time" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="endTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} data-testid="input-end-time" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="roomNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Room 101" {...field} data-testid="input-room" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="academicYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Academic Year</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2025" {...field} data-testid="input-year" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createMutation.isPending || updateMutation.isPending}
                              data-testid="button-save-timetable"
                            >
                              {editingEntry ? 'Update' : 'Create'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : timetable.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">No timetable data available</p>
                <p className="text-sm mt-2">
                  {user?.role === 'student' 
                    ? 'Your class timetable has not been set up yet.'
                    : canManage 
                      ? 'Click "Add Entry" to create timetable entries.'
                      : 'Please select a class or add timetable entries.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {daysToShow.map((day) => (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-xl">{DAYS_MAP[day]}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {groupedByDay[day]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((entry, index) => {
                        const colorClass = COLORS[index % COLORS.length];
                        const duration = calculateDuration(entry.startTime, entry.endTime);
                        const timeRange = `${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`;

                        return (
                          <div
                            key={entry._id}
                            className={`${colorClass} text-white rounded-lg p-4 min-w-[200px] flex-1 shadow-md hover:shadow-lg transition-shadow relative group`}
                            data-testid={`timetable-entry-${entry._id}`}
                          >
                            {canManage && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEdit(entry)}
                                  data-testid={`button-edit-${entry._id}`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDelete(entry._id)}
                                  data-testid={`button-delete-${entry._id}`}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="font-semibold text-sm">{timeRange}</div>
                              <div className="text-xs opacity-90">{duration}</div>
                              <div className="font-bold text-base mt-2">
                                {entry.subjectId?.name || 'Subject'}
                              </div>
                              {entry.subjectId?.code && (
                                <div className="text-xs font-medium opacity-90">
                                  {entry.subjectId.code}
                                </div>
                              )}
                              {entry.roomNumber && (
                                <div className="text-xs opacity-90 mt-2">
                                  {entry.roomNumber}
                                </div>
                              )}
                              {entry.teacherId && (
                                <div className="text-xs opacity-90 mt-1">
                                  {entry.teacherId.firstName} {entry.teacherId.lastName}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
