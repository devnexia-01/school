import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface TimetableEntry {
  _id: string;
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
}

interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
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
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: classesData } = useQuery<{ classes: Class[] }>({
    queryKey: ['/api/classes'],
    enabled: user?.role !== 'student',
  });

  const { data: timetableData, isLoading } = useQuery<{ timetable: TimetableEntry[] }>({
    queryKey: user?.role === 'student' 
      ? ['/api/student/timetable'] 
      : ['/api/timetable', selectedClass],
    enabled: user?.role === 'student' || !!selectedClass,
  });

  const classes = classesData?.classes || [];
  const timetable = timetableData?.timetable || [];

  useEffect(() => {
    if (classes.length > 0 && !selectedClass && user?.role !== 'student') {
      setSelectedClass(classes[0]._id);
    }
  }, [classes, selectedClass, user]);

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
              <div className="flex items-center gap-4">
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
                            className={`${colorClass} text-white rounded-lg p-4 min-w-[200px] flex-1 shadow-md hover:shadow-lg transition-shadow`}
                            data-testid={`timetable-entry-${entry._id}`}
                          >
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
