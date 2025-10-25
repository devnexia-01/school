import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

export default function Academics() {
  const classes = [
    { id: '1', name: 'Grade 8-A', grade: 8, section: 'A', students: 42, capacity: 45, teacher: 'Ms. Anderson' },
    { id: '2', name: 'Grade 8-B', grade: 8, section: 'B', students: 38, capacity: 45, teacher: 'Mr. Wilson' },
    { id: '3', name: 'Grade 9-A', grade: 9, section: 'A', students: 40, capacity: 40, teacher: 'Mrs. Davis' },
    { id: '4', name: 'Grade 10-A', grade: 10, section: 'A', students: 35, capacity: 40, teacher: 'Mr. Thompson' },
    { id: '5', name: 'Grade 11-A', grade: 11, section: 'A', students: 38, capacity: 40, teacher: 'Dr. Martinez' },
    { id: '6', name: 'Grade 12-A', grade: 12, section: 'A', students: 32, capacity: 35, teacher: 'Ms. Rodriguez' },
  ];

  const subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH101', classes: 6, teachers: 3 },
    { id: '2', name: 'Physics', code: 'PHY101', classes: 5, teachers: 2 },
    { id: '3', name: 'Chemistry', code: 'CHEM101', classes: 5, teachers: 2 },
    { id: '4', name: 'English Literature', code: 'ENG101', classes: 6, teachers: 3 },
    { id: '5', name: 'History', code: 'HIST101', classes: 6, teachers: 2 },
    { id: '6', name: 'Computer Science', code: 'CS101', classes: 4, teachers: 2 },
  ];

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
                  <Button data-testid="button-add-class">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={classes}
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
                      key: 'students',
                      header: 'Students',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.students}/{item.capacity}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((item.students / item.capacity) * 100)}% filled
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'teacher',
                      header: 'Class Teacher',
                      cell: (item) => <span>{item.teacher}</span>,
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      cell: (item) => (
                        <Badge variant={item.students < item.capacity ? 'default' : 'secondary'}>
                          {item.students < item.capacity ? 'Active' : 'Full'}
                        </Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: () => (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      ),
                    },
                  ]}
                  testId="classes-table"
                />
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
                  <Button data-testid="button-add-subject">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={subjects}
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
                      key: 'classes',
                      header: 'Classes',
                      cell: (item) => <Badge variant="outline">{item.classes} classes</Badge>,
                    },
                    {
                      key: 'teachers',
                      header: 'Teachers',
                      cell: (item) => <span>{item.teachers} assigned</span>,
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      cell: () => (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Assign</Button>
                        </div>
                      ),
                    },
                  ]}
                  testId="subjects-table"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
