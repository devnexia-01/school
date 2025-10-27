import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Download, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Faculty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  const canManageFaculty = user && ['admin', 'principal'].includes(user.role);

  const facultyMembers = [
    {
      id: '1',
      name: 'Ms. Anderson',
      email: 'teacher@school.com',
      phone: '+1-555-0103',
      department: 'Mathematics',
      subjects: ['Mathematics', 'Statistics'],
      qualification: 'M.Sc Mathematics',
      experience: '10 years',
      status: 'active',
      joiningDate: '2015-06-01',
    },
    {
      id: '2',
      name: 'Dr. Williams',
      email: 'dwilliams@school.com',
      phone: '+1-555-0201',
      department: 'Science',
      subjects: ['Physics', 'Chemistry'],
      qualification: 'Ph.D. Physics',
      experience: '15 years',
      status: 'active',
      joiningDate: '2010-04-15',
    },
    {
      id: '3',
      name: 'Mr. Johnson',
      email: 'mjohnson@school.com',
      phone: '+1-555-0202',
      department: 'English',
      subjects: ['English Literature', 'Grammar'],
      qualification: 'M.A. English',
      experience: '8 years',
      status: 'active',
      joiningDate: '2017-08-01',
    },
    {
      id: '4',
      name: 'Mrs. Brown',
      email: 'sbrown@school.com',
      phone: '+1-555-0203',
      department: 'Computer Science',
      subjects: ['Computer Science', 'Programming'],
      qualification: 'M.Tech CS',
      experience: '12 years',
      status: 'active',
      joiningDate: '2013-07-10',
    },
  ];

  const filteredFaculty = facultyMembers.filter(faculty => {
    const matchesSearch = searchQuery === '' || 
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || faculty.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddFaculty = () => {
    toast({
      title: 'Faculty Added',
      description: 'New faculty member has been added successfully.',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditFaculty = (faculty: any) => {
    setSelectedFaculty(faculty);
    toast({
      title: 'Edit Faculty',
      description: `Editing details for ${faculty.name}`,
    });
  };

  const handleDeleteFaculty = (faculty: any) => {
    toast({
      title: 'Faculty Removed',
      description: `${faculty.name} has been removed from the system.`,
      variant: 'destructive',
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Faculty Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Faculty Management</h1>
            <p className="text-muted-foreground mt-1">Manage faculty members and their information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export-faculty">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {canManageFaculty && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-faculty">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Faculty
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Faculty Member</DialogTitle>
                    <DialogDescription>Enter the details of the new faculty member</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" data-testid="input-first-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" data-testid="input-last-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@school.com" data-testid="input-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1-555-0000" data-testid="input-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="computer-science">Computer Science</SelectItem>
                          <SelectItem value="social-studies">Social Studies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input id="qualification" placeholder="M.Sc, Ph.D, etc." data-testid="input-qualification" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="subjects">Subjects (comma separated)</Label>
                      <Input id="subjects" placeholder="Mathematics, Statistics" data-testid="input-subjects" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button onClick={handleAddFaculty} data-testid="button-save-faculty">
                      Add Faculty
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-faculty"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48" data-testid="select-department-filter">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredFaculty}
              emptyMessage="No faculty members found"
              columns={[
                {
                  key: 'name',
                  header: 'Faculty Member',
                  cell: (item) => (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{item.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'department',
                  header: 'Department',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.department}</p>
                      <p className="text-sm text-muted-foreground">{item.subjects.join(', ')}</p>
                    </div>
                  ),
                },
                {
                  key: 'qualification',
                  header: 'Qualification',
                  cell: (item) => item.qualification,
                },
                {
                  key: 'experience',
                  header: 'Experience',
                  cell: (item) => item.experience,
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
                  cell: (item) => canManageFaculty ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditFaculty(item)}
                        data-testid={`button-edit-faculty-${item.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFaculty(item)}
                        data-testid={`button-delete-faculty-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
