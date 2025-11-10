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
  const isTeacher = user?.role === 'faculty';
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    totalMarks: '100',
    description: '',
    academicYear: new Date().getFullYear().toString(),
    published: false,
  });

  const { data: examsData, isLoading: examsLoading } = useQuery<{ exams: any[] }>({
    queryKey: ['/api/exams'],
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery<{ results: any[] }>({
    queryKey: isStudent ? ['/api/student/exam-results'] : [],
    enabled: isStudent,
  });

  const { data: examDetailsData, isLoading: isExamDetailsLoading } = useQuery<{
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    stats?: {
      totalAttempts: number;
      uniqueStudents: number;
      averageMarks: number;
    };
    results?: any[];
  }>({
    queryKey: ['/api/exams', selectedExamId],
    enabled: !!selectedExamId && (canManageExams || isTeacher),
  });

  const exams = examsData?.exams || [];
  const results = resultsData?.results || [];
  const examDetails = selectedExamId ? examDetailsData : null;

  const createExamMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          ...examForm,
          totalMarks: parseInt(examForm.totalMarks),
          academicYear: examForm.academicYear,
          published: examForm.published,
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
        academicYear: new Date().getFullYear().toString(),
        published: false,
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

  const testExams = exams.filter((exam: any) => exam.type === 'unit_test' || exam.type === 'practical');
  const halfYearlyExams = exams.filter((exam: any) => exam.type === 'mid_term');
  const finalExams = exams.filter((exam: any) => exam.type === 'final');

  const handleDownloadMarksheet = () => {
    toast({
      title: 'Coming Soon',
      description: 'Marksheet download feature will be available soon',
    });
  };

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
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="half_yearly">Half Yearly</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="midterm">Mid-Term</SelectItem>
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
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Input
                      id="academic-year"
                      type="text"
                      placeholder="2024-2025"
                      value={examForm.academicYear}
                      onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                      data-testid="input-academic-year"
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

        <Tabs defaultValue={isStudent ? "tests" : "upcoming"} className="space-y-6">
          <TabsList>
            {isStudent ? (
              <>
                <TabsTrigger value="tests" data-testid="tab-tests">
                  <FileText className="h-4 w-4 mr-2" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="half_yearly" data-testid="tab-half-yearly">
                  <Calendar className="h-4 w-4 mr-2" />
                  Half Yearly
                </TabsTrigger>
                <TabsTrigger value="final" data-testid="tab-final">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Final Exams
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="schedule" data-testid="tab-schedule">
                  <FileText className="h-4 w-4 mr-2" />
                  All Exams
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
                      cell: (item: any) => (
                        <div
                          onClick={() => (canManageExams || isTeacher) && setSelectedExamId(item._id)}
                          className={(canManageExams || isTeacher) ? "cursor-pointer hover-elevate p-2 rounded-md transition-all" : ""}
                          data-testid={`exam-name-${item._id}`}
                        >
                          <p className="font-medium">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Schedule',
                      cell: (item: any) => (
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
                      cell: (item: any) => getStatusBadge(item),
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
                        cell: (item: any) => (
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.type}</p>
                          </div>
                        ),
                      },
                      {
                        key: 'endDate',
                        header: 'Ends On',
                        cell: (item: any) => format(new Date(item.endDate), 'MMM dd, yyyy'),
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (item: any) => <Badge>In Progress</Badge>,
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
                      cell: (item: any) => (
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Dates',
                      cell: (item: any) => (
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
                      cell: (item: any) => getStatusBadge(item),
                    },
                  ]}
                  testId="all-exams-table"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tests</CardTitle>
                <CardDescription>All test examinations</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={testExams}
                  isLoading={examsLoading}
                  emptyMessage="No test exams available"
                  columns={[
                    {
                      key: 'name',
                      header: 'Exam Name',
                      cell: (item: any) => (
                        <div
                          onClick={() => (canManageExams || isTeacher) && setSelectedExamId(item._id)}
                          className={(canManageExams || isTeacher) ? "cursor-pointer hover-elevate p-2 rounded-md transition-all" : ""}
                          data-testid={`exam-name-${item._id}`}
                        >
                          <p className="font-medium">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Schedule',
                      cell: (item: any) => (
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
                      cell: (item: any) => getStatusBadge(item),
                    },
                    ...(isStudent ? [{
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadMarksheet}
                          data-testid={`download-marksheet-${item._id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Marksheet
                        </Button>
                      ),
                    }] : []),
                  ]}
                  testId="tests-table"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="half_yearly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Half Yearly Examinations</CardTitle>
                <CardDescription>All half yearly exams</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={halfYearlyExams}
                  isLoading={examsLoading}
                  emptyMessage="No half yearly exams available"
                  columns={[
                    {
                      key: 'name',
                      header: 'Exam Name',
                      cell: (item: any) => (
                        <div
                          onClick={() => (canManageExams || isTeacher) && setSelectedExamId(item._id)}
                          className={(canManageExams || isTeacher) ? "cursor-pointer hover-elevate p-2 rounded-md transition-all" : ""}
                          data-testid={`exam-name-${item._id}`}
                        >
                          <p className="font-medium">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Schedule',
                      cell: (item: any) => (
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
                      cell: (item: any) => getStatusBadge(item),
                    },
                    ...(isStudent ? [{
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadMarksheet}
                          data-testid={`download-marksheet-${item._id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Marksheet
                        </Button>
                      ),
                    }] : []),
                  ]}
                  testId="half-yearly-table"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="final" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Examinations</CardTitle>
                <CardDescription>All final exams</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={finalExams}
                  isLoading={examsLoading}
                  emptyMessage="No final exams available"
                  columns={[
                    {
                      key: 'name',
                      header: 'Exam Name',
                      cell: (item: any) => (
                        <div
                          onClick={() => (canManageExams || isTeacher) && setSelectedExamId(item._id)}
                          className={(canManageExams || isTeacher) ? "cursor-pointer hover-elevate p-2 rounded-md transition-all" : ""}
                          data-testid={`exam-name-${item._id}`}
                        >
                          <p className="font-medium">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      header: 'Schedule',
                      cell: (item: any) => (
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
                      cell: (item: any) => getStatusBadge(item),
                    },
                    ...(isStudent ? [{
                      key: 'actions',
                      header: 'Actions',
                      cell: (item: any) => (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadMarksheet}
                          data-testid={`download-marksheet-${item._id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Marksheet
                        </Button>
                      ),
                    }] : []),
                  ]}
                  testId="final-exams-table"
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
                          cell: (item: any) => (
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
                          cell: (item: any) => (
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
                          cell: (item: any) => (
                            <Badge variant="outline" data-testid={`result-grade-${item._id}`}>
                              {item.grade || 'N/A'}
                            </Badge>
                          ),
                        },
                        {
                          key: 'date',
                          header: 'Date',
                          cell: (item: any) =>
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

        {/* Exam Details Dialog */}
        <Dialog open={!!selectedExamId} onOpenChange={() => setSelectedExamId(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-exam-details">
            <DialogHeader>
              <DialogTitle>Exam Details</DialogTitle>
              <DialogDescription>View exam information and student attempts</DialogDescription>
            </DialogHeader>
            {isExamDetailsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading exam details...</div>
            ) : examDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Exam Name</p>
                    <p className="font-medium" data-testid="text-exam-name">{examDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize" data-testid="text-exam-type">{examDetails.type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium" data-testid="text-start-date">
                      {examDetails.startDate ? format(new Date(examDetails.startDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium" data-testid="text-end-date">
                      {examDetails.endDate ? format(new Date(examDetails.endDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>

                {examDetails.stats && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Attempts</p>
                      <p className="text-2xl font-bold" data-testid="text-total-attempts">{examDetails.stats.totalAttempts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Students</p>
                      <p className="text-2xl font-bold" data-testid="text-unique-students">{examDetails.stats.uniqueStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Marks</p>
                      <p className="text-2xl font-bold" data-testid="text-average-marks">{examDetails.stats.averageMarks}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Student Attempts</h3>
                  {examDetails.results && examDetails.results.length > 0 ? (
                    <DataTable
                      data={examDetails.results}
                      emptyMessage="No attempts yet"
                      columns={[
                        {
                          key: 'student',
                          header: 'Student',
                          cell: (item: any) => (
                            <div>
                              <p className="font-medium">
                                {item.studentId?.firstName} {item.studentId?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.studentId?.rollNumber || 'N/A'}</p>
                            </div>
                          ),
                        },
                        {
                          key: 'subject',
                          header: 'Subject',
                          cell: (item: any) => item.subjectId?.name || 'N/A',
                        },
                        {
                          key: 'marks',
                          header: 'Marks',
                          cell: (item: any) => (
                            <span className="font-medium">
                              {item.marksObtained}/{item.totalMarks}
                            </span>
                          ),
                        },
                        {
                          key: 'percentage',
                          header: 'Percentage',
                          cell: (item: any) => {
                            const percentage = ((item.marksObtained / item.totalMarks) * 100).toFixed(2);
                            return <span>{percentage}%</span>;
                          },
                        },
                        {
                          key: 'grade',
                          header: 'Grade',
                          cell: (item: any) => <Badge variant="outline">{item.grade || 'N/A'}</Badge>,
                        },
                      ]}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No student attempts recorded yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Exam not found</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
