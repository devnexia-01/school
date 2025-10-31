import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { FileText, Download, Calendar, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Examinations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isStudent = user?.role === 'student';
  const canManageExams = user && ['admin', 'principal', 'super_admin'].includes(user.role);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    totalMarks: '100',
    description: '',
  });

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['/api/exams'],
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: isStudent ? ['/api/student/exam-results'] : [],
    enabled: isStudent,
  });

  const exams = examsData?.exams || [];
  const results = resultsData?.results || [];

  const createExamMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          ...examForm,
          totalMarks: parseInt(examForm.totalMarks),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Exam created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      setIsAddExamDialogOpen(false);
      setExamForm({
        name: '',
        type: '',
        startDate: '',
        endDate: '',
        totalMarks: '100',
        description: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create exam',
        variant: 'destructive',
      });
    },
  });

  const handleCreateExam = () => {
    if (!examForm.name || !examForm.type || !examForm.startDate || !examForm.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createExamMutation.mutate();
  };

  const now = new Date();
  const upcomingExams = exams.filter((exam: any) => new Date(exam.startDate) > now);
  const completedExams = exams.filter((exam: any) => new Date(exam.endDate) < now);
  const ongoingExams = exams.filter(
    (exam: any) => new Date(exam.startDate) <= now && new Date(exam.endDate) >= now
  );

  const getStatusBadge = (exam: any) => {
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (now < startDate) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now >= startDate && now <= endDate) {
      return <Badge>In Progress</Badge>;
    } else {
      return <Badge variant="outline">Completed</Badge>;
    }
  };

  const calculatePercentage = (marksObtained: number, totalMarks: number) => {
    return ((marksObtained / totalMarks) * 100).toFixed(2);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={[{ label: 'Examinations' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Examinations</h1>
            <p className="text-muted-foreground mt-1">
              {isStudent ? 'View your exam schedule and results' : 'Manage exams and results'}
            </p>
          </div>
          {canManageExams && (
            <Dialog open={isAddExamDialogOpen} onOpenChange={setIsAddExamDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-exam">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Exam</DialogTitle>
                  <DialogDescription>Create a new examination schedule</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name *</Label>
                    <Input
                      id="exam-name"
                      placeholder="e.g., Mid-Term Exam"
                      value={examForm.name}
                      onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                      data-testid="input-exam-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-type">Exam Type *</Label>
                    <Select value={examForm.type} onValueChange={(value) => setExamForm({ ...examForm, type: value })}>
                      <SelectTrigger data-testid="select-exam-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midterm">Mid-Term</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={examForm.startDate}
                        onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                        data-testid="input-start-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={examForm.endDate}
                        onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                        data-testid="input-end-date"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input
                      id="total-marks"
                      type="number"
                      placeholder="100"
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                      data-testid="input-total-marks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Optional description"
                      value={examForm.description}
                      onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                      data-testid="input-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddExamDialogOpen(false)} data-testid="button-cancel-exam">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateExam} disabled={createExamMutation.isPending} data-testid="button-create-exam">
                    {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">
              <FileText className="h-4 w-4 mr-2" />
              All Exams
            </TabsTrigger>
            {isStudent && (
              <>
                <TabsTrigger value="results" data-testid="tab-results">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="marksheets" data-testid="tab-marksheets">
                  <Download className="h-4 w-4 mr-2" />
                  Marksheets
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Examinations</CardTitle>
                <CardDescription>Exams scheduled for the future</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={upcomingExams}
                  isLoading={examsLoading}
                  emptyMessage="No upcoming exams"
                  columns={[
                    {
                      key: 'name',
                      header: 'Exam Name',
                      cell: (item) => (
                        <div>
                          <p className="font-medium" data-testid={`exam-name-${item._id}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Schedule',
                      cell: (item) => (
                        <div>
                          <p className="text-sm">
                            {format(new Date(item.startDate), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            to {format(new Date(item.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => getStatusBadge(item),
                    },
                  ]}
                  testId="upcoming-exams-table"
                />
              </CardContent>
            </Card>

            {ongoingExams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>Exams happening now</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={ongoingExams}
                    emptyMessage="No ongoing exams"
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
                        key: 'endDate',
                        header: 'Ends On',
                        cell: (item) => format(new Date(item.endDate), 'MMM dd, yyyy'),
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (item) => <Badge>In Progress</Badge>,
                      },
                    ]}
                    testId="ongoing-exams-table"
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Examinations</CardTitle>
                <CardDescription>Complete exam schedule</CardDescription>
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
                          <p className="text-sm">
                            {format(new Date(item.startDate), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            to {format(new Date(item.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => getStatusBadge(item),
                    },
                  ]}
                  testId="all-exams-table"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {isStudent && (
            <>
              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <CardDescription>Your academic performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={results}
                      isLoading={resultsLoading}
                      emptyMessage="No results available"
                      columns={[
                        {
                          key: 'exam',
                          header: 'Exam',
                          cell: (item) => (
                            <div>
                              <p className="font-medium" data-testid={`result-exam-${item._id}`}>
                                {item.examId?.name || 'Exam'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.subjectId?.name || 'Subject'}
                              </p>
                            </div>
                          ),
                        },
                        {
                          key: 'marks',
                          header: 'Marks',
                          cell: (item) => (
                            <div>
                              <p className="font-mono font-medium">
                                {item.marksObtained || 0}/{item.totalMarks || 100}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {calculatePercentage(
                                  item.marksObtained || 0,
                                  item.totalMarks || 100
                                )}
                                %
                              </p>
                            </div>
                          ),
                        },
                        {
                          key: 'grade',
                          header: 'Grade',
                          cell: (item) => (
                            <Badge variant="outline" data-testid={`result-grade-${item._id}`}>
                              {item.grade || 'N/A'}
                            </Badge>
                          ),
                        },
                        {
                          key: 'date',
                          header: 'Date',
                          cell: (item) =>
                            item.createdAt
                              ? format(new Date(item.createdAt), 'MMM dd, yyyy')
                              : 'N/A',
                        },
                      ]}
                      testId="results-table"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marksheets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Marksheets</CardTitle>
                    <CardDescription>Download your exam marksheets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {completedExams.length > 0 ? (
                      <div className="space-y-3">
                        {completedExams.map((exam: any) => (
                          <div
                            key={exam._id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            data-testid={`marksheet-${exam._id}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{exam.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(exam.endDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" data-testid={`download-${exam._id}`}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No marksheets available yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
