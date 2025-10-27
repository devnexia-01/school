import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth';

export default function Students() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/students'],
  });

  const { data: classesData } = useQuery<{ classes: Array<{ id: string; name: string }> }>({
    queryKey: ['/api/classes'],
  });

  const allStudents = data?.students || [];
  
  const canAddStudent = user && ['admin', 'principal'].includes(user.role);
  
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    
    return matchesSearch && matchesClass;
  });
  
  const students = filteredStudents;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Students' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Students</h1>
            <p className="text-muted-foreground mt-1">Manage student information and records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export-students">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {canAddStudent && (
              <Link href="/students/add">
                <Button data-testid="button-add-student">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, admission number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-students"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-class-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classesData?.classes?.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={students}
              columns={[
                {
                  key: 'student',
                  header: 'Student',
                  cell: (item) => (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback>
                          {item.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.admissionNumber}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'class',
                  header: 'Class & Roll',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.class}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {item.rollNumber}</p>
                    </div>
                  ),
                },
                {
                  key: 'contact',
                  header: 'Contact',
                  cell: (item) => (
                    <div>
                      <p className="text-sm">{item.email}</p>
                      <p className="text-sm text-muted-foreground">{item.phone}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  cell: (item) => (
                    <div className="flex items-center gap-2">
                      <Link href={`/students/${item.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${item.id}`}>
                          View
                        </Button>
                      </Link>
                      <Link href={`/students/${item.id}/edit`}>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-${item.id}`}>
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ),
                },
              ]}
              isLoading={isLoading}
              emptyMessage="No students found"
              testId="students-table"
              pagination={{
                page,
                pageSize: 10,
                total: data?.total || students.length,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
