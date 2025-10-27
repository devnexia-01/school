import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

export default function Examinations() {
  const { user } = useAuth();
  const canCreateExam = user && ['admin', 'principal'].includes(user.role);

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['/api/exams'],
  });

  const exams = examsData?.exams || [];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Examinations' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Examinations</h1>
            <p className="text-muted-foreground mt-1">Manage exams, grades, and student performance</p>
          </div>
        </div>

        <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Examinations</CardTitle>
                    <CardDescription>Schedule and manage examinations</CardDescription>
                  </div>
                  {canCreateExam && (
                    <Button data-testid="button-create-exam">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Exam
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={exams}
                  isLoading={examsLoading}
                  emptyMessage="No exams scheduled"
                  columns={[
                    {
                      key: 'name',
                      header: 'Exam Name',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Dates',
                      cell: (item) => (
                        <div>
                          <p className="text-sm">{item.startDate}</p>
                          <p className="text-sm text-muted-foreground">to {item.endDate}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => (
                        <Badge
                          variant={
                            item.status === 'in_progress' ? 'default' :
                            item.status === 'upcoming' ? 'secondary' :
                            'outline'
                          }
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: () => (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ),
                    },
                  ]}
                  testId="exams-table"
                />
              </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
