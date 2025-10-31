import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
  capacity: number;
  classTeacherId?: string;
  academicYear: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.coerce.number().positive('Grade must be a positive number'),
  section: z.string().min(1, 'Section is required'),
  capacity: z.coerce.number().positive('Capacity must be a positive number'),
  academicYear: z.string().min(4, 'Academic year is required'),
});

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;
type SubjectFormData = z.infer<typeof subjectSchema>;

export default function Academics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const canManageAcademics = user && ['admin', 'principal'].includes(user.role);
  
  const { data: classesData, isLoading: classesLoading } = useQuery<{ classes: Class[] }>({
    queryKey: ['/api/classes'],
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery<{ subjects: Subject[] }>({
    queryKey: ['/api/subjects'],
  });

  const classes = classesData?.classes || [];
  const subjects = subjectsData?.subjects || [];

  const classForm = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      grade: 1,
      section: '',
      capacity: 40,
      academicYear: new Date().getFullYear().toString(),
    },
  });

  const subjectForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  const createClassMutation = useMutation({
    mutationFn: (data: ClassFormData) =>
      apiRequest('/api/classes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({ title: 'Success', description: 'Class created successfully' });
      setIsClassDialogOpen(false);
      classForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create class',
        variant: 'destructive',
      });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: SubjectFormData) =>
      apiRequest('/api/subjects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({ title: 'Success', description: 'Subject created successfully' });
      setIsSubjectDialogOpen(false);
      subjectForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subject',
        variant: 'destructive',
      });
    },
  });

  const onClassSubmit = (data: ClassFormData) => {
    createClassMutation.mutate(data);
  };

  const onSubjectSubmit = (data: SubjectFormData) => {
    createSubjectMutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Academics' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Academic Management</h1>
            <p className="text-muted-foreground mt-1">Manage classes, subjects, and curriculum</p>
          </div>
        </div>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="classes" data-testid="tab-classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects" data-testid="tab-subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Classes</CardTitle>
                    <CardDescription>Manage class sections and capacity</CardDescription>
                  </div>
                  {canManageAcademics && (
                    <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-class">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Class
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Class</DialogTitle>
                        </DialogHeader>
                        <Form {...classForm}>
                          <form onSubmit={classForm.handleSubmit(onClassSubmit)} className="space-y-4">
                            <FormField
                              control={classForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Class Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Class 1A" {...field} data-testid="input-class-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={classForm.control}
                                name="grade"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Grade</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="e.g., 1" {...field} data-testid="input-grade" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={classForm.control}
                                name="section"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Section</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., A" {...field} data-testid="input-section" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={classForm.control}
                              name="capacity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Capacity</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="e.g., 40" {...field} data-testid="input-capacity" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={classForm.control}
                              name="academicYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Academic Year</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 2025" {...field} data-testid="input-academic-year" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={createClassMutation.isPending} data-testid="button-submit-class">
                                {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading classes...</div>
                ) : (
                  <DataTable
                    data={classes}
                    emptyMessage="No classes found. Add a class to get started."
                    columns={[
                      {
                        key: 'name',
                        header: 'Class Name',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Grade {item.grade} - Section {item.section}</p>
                          </div>
                        ),
                      },
                      {
                        key: 'capacity',
                        header: 'Capacity',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{item.capacity} students</p>
                          </div>
                        ),
                      },
                      {
                        key: 'academicYear',
                        header: 'Academic Year',
                        cell: (item) => <span>{item.academicYear}</span>,
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: () => (
                          <Badge variant="default">Active</Badge>
                        ),
                      },
                      {
                        key: 'actions',
                        header: 'Actions',
                        cell: () => canManageAcademics ? (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ) : null,
                      },
                    ]}
                    testId="classes-table"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Subjects</CardTitle>
                    <CardDescription>Manage subject curriculum and assignments</CardDescription>
                  </div>
                  {canManageAcademics && (
                    <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-subject">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Subject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Subject</DialogTitle>
                        </DialogHeader>
                        <Form {...subjectForm}>
                          <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)} className="space-y-4">
                            <FormField
                              control={subjectForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Mathematics" {...field} data-testid="input-subject-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={subjectForm.control}
                              name="code"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., MATH101" {...field} data-testid="input-subject-code" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={subjectForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Subject description" {...field} data-testid="input-subject-description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={createSubjectMutation.isPending} data-testid="button-submit-subject">
                                {createSubjectMutation.isPending ? 'Creating...' : 'Create Subject'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>
                ) : (
                  <DataTable
                    data={subjects}
                    emptyMessage="No subjects found. Add a subject to get started."
                    columns={[
                      {
                        key: 'subject',
                        header: 'Subject',
                        cell: (item) => (
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{item.code}</p>
                          </div>
                        ),
                      },
                      {
                        key: 'description',
                        header: 'Description',
                        cell: (item) => <span>{item.description || 'N/A'}</span>,
                      },
                      {
                        key: 'actions',
                        header: 'Actions',
                        cell: () => canManageAcademics ? (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Assign</Button>
                          </div>
                        ) : null,
                      },
                    ]}
                    testId="subjects-table"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
