import { useState } from 'react';
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

export default function Academics() {
  const { user } = useAuth();
  const canManageAcademics = user && ['admin', 'principal'].includes(user.role);
  
  const { data: classesData, isLoading: classesLoading } = useQuery<{ classes: Class[] }>({
    queryKey: ['/api/classes'],
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery<{ subjects: Subject[] }>({
    queryKey: ['/api/subjects'],
  });

  const classes = classesData?.classes || [];
  const subjects = subjectsData?.subjects || [];

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
                    <Button data-testid="button-add-class">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Class
                    </Button>
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
                    <Button data-testid="button-add-subject">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
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
