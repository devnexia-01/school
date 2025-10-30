import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { label: 'Period 1', time: '08:00 - 09:00' },
  { label: 'Period 2', time: '09:00 - 10:00' },
  { label: 'Period 3', time: '10:00 - 11:00' },
  { label: 'Break', time: '11:00 - 11:15' },
  { label: 'Period 4', time: '11:15 - 12:15' },
  { label: 'Period 5', time: '12:15 - 01:15' },
  { label: 'Lunch', time: '01:15 - 02:00' },
  { label: 'Period 6', time: '02:00 - 03:00' },
];

export default function Timetable() {
  const { user } = useAuth();
  
  const { data: timetableData, isLoading } = useQuery({
    queryKey: user?.role === 'student' ? ['/api/student/timetable'] : ['/api/classes'],
    enabled: !!user,
  });

  const timetable = timetableData?.timetable || [];

  const getTimetableForDayAndPeriod = (dayIndex: number, periodIndex: number) => {
    return timetable.find(
      (item: any) => item.day === dayIndex && item.period === periodIndex
    );
  };

  const isBreakPeriod = (periodLabel: string) => {
    return periodLabel === 'Break' || periodLabel === 'Lunch';
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Timetable' }]} />

        <div>
          <h1 className="text-3xl font-semibold">Class Timetable</h1>
          <p className="text-muted-foreground mt-1">Weekly schedule at a glance</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>All classes and periods for the week</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    <div className="font-semibold text-sm text-center p-2">Period / Day</div>
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="font-semibold text-sm text-center p-2 bg-primary/5 rounded"
                        data-testid={`header-${day.toLowerCase()}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {PERIODS.map((period, periodIndex) => (
                    <div
                      key={period.label}
                      className="grid grid-cols-7 gap-2 mb-2"
                      data-testid={`row-${period.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <div
                        className={`text-sm p-3 rounded border ${
                          isBreakPeriod(period.label)
                            ? 'bg-muted/50'
                            : 'bg-background'
                        }`}
                      >
                        <div className="font-medium">{period.label}</div>
                        <div className="text-xs text-muted-foreground">{period.time}</div>
                      </div>

                      {DAYS.map((_, dayIndex) => {
                        if (isBreakPeriod(period.label)) {
                          return (
                            <div
                              key={dayIndex}
                              className="text-sm p-3 rounded border bg-muted/30 flex items-center justify-center"
                              data-testid={`cell-day${dayIndex}-period${periodIndex}`}
                            >
                              <span className="text-muted-foreground text-xs">
                                {period.label}
                              </span>
                            </div>
                          );
                        }

                        const classItem = getTimetableForDayAndPeriod(dayIndex, periodIndex);

                        return (
                          <div
                            key={dayIndex}
                            className={`text-sm p-3 rounded border ${
                              classItem
                                ? 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 cursor-pointer transition-colors'
                                : 'bg-background hover:bg-muted/50'
                            }`}
                            data-testid={`cell-day${dayIndex}-period${periodIndex}`}
                          >
                            {classItem ? (
                              <div className="space-y-1">
                                <div className="font-medium text-primary">
                                  {classItem.subjectId?.name || 'Subject'}
                                </div>
                                {classItem.subjectId?.code && (
                                  <Badge variant="outline" className="text-xs">
                                    {classItem.subjectId.code}
                                  </Badge>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {classItem.teacherId
                                    ? `${classItem.teacherId.firstName} ${classItem.teacherId.lastName}`
                                    : 'Teacher TBA'}
                                </div>
                                {classItem.room && (
                                  <div className="text-xs text-muted-foreground">
                                    Room {classItem.room}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground text-center">
                                Free
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/20 border"></div>
                <span className="text-sm">Scheduled Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/30 border"></div>
                <span className="text-sm">Break / Lunch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-background border"></div>
                <span className="text-sm">Free Period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
