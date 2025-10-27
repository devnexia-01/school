import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Building2, Users, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrencyINR } from '@/lib/utils';

export default function Tenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canManageTenants = user && user.role === 'super_admin';

  const tenants = [
    {
      id: '1',
      name: 'Springfield High School',
      code: 'SHS001',
      email: 'admin@springfield.edu',
      phone: '+1-555-0100',
      address: '123 Education Lane, Springfield',
      studentsCount: 610,
      facultyCount: 45,
      plan: 'Premium',
      status: 'active',
      subscription: {
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        price: 5000,
      },
    },
    {
      id: '2',
      name: 'Riverside Academy',
      code: 'RA002',
      email: 'admin@riverside.edu',
      phone: '+1-555-0200',
      address: '456 River Road, Riverside',
      studentsCount: 450,
      facultyCount: 35,
      plan: 'Standard',
      status: 'active',
      subscription: {
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        price: 3000,
      },
    },
    {
      id: '3',
      name: 'Greenwood International',
      code: 'GI003',
      email: 'admin@greenwood.edu',
      phone: '+1-555-0300',
      address: '789 Green Avenue, Greenwood',
      studentsCount: 820,
      facultyCount: 62,
      plan: 'Enterprise',
      status: 'active',
      subscription: {
        startDate: '2023-09-01',
        endDate: '2025-08-31',
        price: 8000,
      },
    },
    {
      id: '4',
      name: 'Oakdale School',
      code: 'OS004',
      email: 'admin@oakdale.edu',
      phone: '+1-555-0400',
      address: '321 Oak Street, Oakdale',
      studentsCount: 280,
      facultyCount: 22,
      plan: 'Basic',
      status: 'trial',
      subscription: {
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        price: 0,
      },
    },
  ];

  const handleAddTenant = () => {
    toast({
      title: 'Tenant Added',
      description: 'New school has been added successfully.',
    });
    setIsAddDialogOpen(false);
  };

  const totalSchools = tenants.length;
  const totalStudents = tenants.reduce((sum, t) => sum + t.studentsCount, 0);
  const totalFaculty = tenants.reduce((sum, t) => sum + t.facultyCount, 0);
  const activeSchools = tenants.filter(t => t.status === 'active').length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'School Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">School Management</h1>
            <p className="text-muted-foreground mt-1">Manage all schools on the platform</p>
          </div>
          {canManageTenants && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-tenant">
                  <Plus className="mr-2 h-4 w-4" />
                  Add School
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                  <DialogDescription>Enter the details of the new school</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input id="schoolName" placeholder="Springfield High School" data-testid="input-school-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">School Code</Label>
                    <Input id="schoolCode" placeholder="SHS001" data-testid="input-school-code" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="admin@school.edu" data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1-555-0000" data-testid="input-phone" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main Street" data-testid="input-address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select>
                      <SelectTrigger data-testid="select-plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - {formatCurrencyINR(1000)}/year</SelectItem>
                        <SelectItem value="standard">Standard - {formatCurrencyINR(3000)}/year</SelectItem>
                        <SelectItem value="premium">Premium - {formatCurrencyINR(5000)}/year</SelectItem>
                        <SelectItem value="enterprise">Enterprise - {formatCurrencyINR(8000)}/year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input id="maxStudents" type="number" placeholder="500" data-testid="input-max-students" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handleAddTenant} data-testid="button-save-tenant">
                    Add School
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Schools"
            value={totalSchools.toString()}
            icon={Building2}
            trend={{ value: 25, label: 'vs last year', isPositive: true }}
          />
          <StatCard
            title="Active Schools"
            value={activeSchools.toString()}
            icon={Building2}
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            icon={GraduationCap}
          />
          <StatCard
            title="Total Faculty"
            value={totalFaculty.toString()}
            icon={Users}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tenants}
              emptyMessage="No schools found"
              columns={[
                {
                  key: 'school',
                  header: 'School',
                  cell: (item) => (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.code}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'contact',
                  header: 'Contact',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.email}</p>
                      <p className="text-sm text-muted-foreground">{item.phone}</p>
                    </div>
                  ),
                },
                {
                  key: 'stats',
                  header: 'Users',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.studentsCount} Students</p>
                      <p className="text-sm text-muted-foreground">{item.facultyCount} Faculty</p>
                    </div>
                  ),
                },
                {
                  key: 'plan',
                  header: 'Plan',
                  cell: (item) => (
                    <div>
                      <p className="font-medium">{item.plan}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrencyINR(item.subscription.price)}/year</p>
                    </div>
                  ),
                },
                {
                  key: 'subscription',
                  header: 'Subscription',
                  cell: (item) => (
                    <div>
                      <p className="text-sm">
                        {new Date(item.subscription.startDate).toLocaleDateString()} -{' '}
                        {new Date(item.subscription.endDate).toLocaleDateString()}
                      </p>
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
                  cell: (item) => canManageTenants ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-tenant-${item.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-manage-tenant-${item.id}`}>
                        Manage
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
