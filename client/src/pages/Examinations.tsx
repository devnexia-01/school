import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

export default function Examinations() {
  const exams = [
    { id: '1', name: 'Mid-term Examination', type: 'Mid-term', startDate: '2025-02-01', endDate: '2025-02-10', status: 'upcoming' },
    { id: '2', name: 'Unit Test 3', type: 'Unit Test', startDate: '2025-01-25', endDate: '2025-01-27', status: 'in_progress' },
    { id: '3', name: 'Final Examination', type: 'Final', startDate: '2025-03-15', endDate: '2025-03-25', status: 'scheduled' },
  ];

  const results = [
    { id: '1', student: 'Sarah Johnson', exam: 'Unit Test 2', subject: 'Mathematics', marks: 85, totalMarks: 100, grade: 'A' },
    { id: '2', student: 'Michael Chen', exam: 'Unit Test 2', subject: 'Physics', marks: 78, totalMarks: 100, grade: 'B+' },
    { id: '3', student: 'Emma Williams', exam: 'Unit Test 2', subject: 'Chemistry', marks: 92, totalMarks: 100, grade: 'A+' },
    { id: '4', student: 'James Brown', exam: 'Unit Test 2', subject: 'Mathematics', marks: 68, totalMarks: 100, grade: 'B' },
    { id: '5', student: 'Olivia Davis', exam: 'Unit Test 2', subject: 'English', marks: 88, totalMarks: 100, grade: 'A' },
  ];

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

        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="exams" data-testid="tab-exams">Exams</TabsTrigger>
            <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Examinations</CardTitle>
                    <CardDescription>Schedule and manage examinations</CardDescription>
                  </div>
                  <Button data-testid="button-create-exam">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={exams}
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
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
                <CardDescription>Student performance and grades</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={results}
                  columns={[
                    {
                      key: 'student',
                      header: 'Student',
                      cell: (item) => <span className="font-medium">{item.student}</span>,
                    },
                    {
                      key: 'exam',
                      header: 'Exam',
                      cell: (item) => (
                        <div>
                          <p className="text-sm">{item.exam}</p>
                          <p className="text-sm text-muted-foreground">{item.subject}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'marks',
                      header: 'Marks',
                      cell: (item) => (
                        <span className="font-mono font-medium">
                          {item.marks}/{item.totalMarks}
                        </span>
                      ),
                    },
                    {
                      key: 'percentage',
                      header: 'Percentage',
                      cell: (item) => (
                        <span className="font-medium">
                          {Math.round((item.marks / item.totalMarks) * 100)}%
                        </span>
                      ),
                    },
                    {
                      key: 'grade',
                      header: 'Grade',
                      cell: (item) => (
                        <Badge variant="outline" className="font-mono">
                          {item.grade}
                        </Badge>
                      ),
                    },
                  ]}
                  testId="results-table"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
