import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Building2, Users, GraduationCap, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrencyINR } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Tenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('free');

  const canManageTenants = user && user.role === 'super_admin';

  // Fetch tenants from API
  const { data: tenantsData, isLoading } = useQuery<{ tenants: any[] }>({
    queryKey: ['/api/tenants/with-stats'],
    enabled: !!canManageTenants,
  });

  const tenants = (tenantsData as { tenants: any[] } | undefined)?.tenants || [];

  // Mutation to add new tenant
  const addTenantMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; email?: string; phone?: string; address?: string; plan?: string }) => {
      return await apiRequest('/api/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants/with-stats'] });
      toast({
        title: 'School Added',
        description: 'New school has been added successfully.',
      });
      setIsAddDialogOpen(false);
      // Reset form
      setName('');
      setCode('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPlan('free');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add school',
        variant: 'destructive',
      });
    },
  });

  const handleAddTenant = () => {
    if (!name || !code) {
      toast({
        title: 'Validation Error',
        description: 'School name and code are required',
        variant: 'destructive',
      });
      return;
    }

    addTenantMutation.mutate({
      name,
      code,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      plan: plan || undefined,
    });
  };

  const totalSchools = tenants.length;
  const totalStudents = tenants.reduce((sum: number, t: any) => sum + (t.studentsCount || 0), 0);
  const totalFaculty = tenants.reduce((sum: number, t: any) => sum + (t.facultyCount || 0), 0);
  const activeSchools = tenants.filter((t: any) => t.active).length;

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
                    <Label htmlFor="schoolName">School Name *</Label>
                    <Input 
                      id="schoolName" 
                      placeholder="Springfield High School" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-school-name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">School Code *</Label>
                    <Input 
                      id="schoolCode" 
                      placeholder="SHS001" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      data-testid="input-school-code" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger id="plan" data-testid="select-plan">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@school.edu" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+1-555-0000" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-testid="input-phone" 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main Street" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      data-testid="input-address" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} 
                    disabled={addTenantMutation.isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddTenant} 
                    disabled={addTenantMutation.isPending}
                    data-testid="button-save-tenant"
                  >
                    {addTenantMutation.isPending ? 'Adding...' : 'Add School'}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={tenants}
                emptyMessage="No schools found"
                columns={[
                  {
                    key: 'school',
                    header: 'School',
                    cell: (item: any) => (
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
                    cell: (item: any) => (
                      <div>
                        <p className="font-medium">{item.email || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{item.phone || 'N/A'}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'plan',
                    header: 'Plan',
                    cell: (item: any) => (
                      <Badge variant={item.plan === 'enterprise' ? 'default' : item.plan === 'premium' ? 'default' : 'secondary'}>
                        {item.plan ? item.plan.charAt(0).toUpperCase() + item.plan.slice(1) : 'Free'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'stats',
                    header: 'Users',
                    cell: (item: any) => (
                      <div>
                        <p className="font-medium">{item.studentsCount || 0} Students</p>
                        <p className="text-sm text-muted-foreground">{item.facultyCount || 0} Faculty</p>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (item: any) => (
                      <Badge variant={item.active ? 'default' : 'secondary'}>
                        {item.active ? 'active' : 'inactive'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    cell: (item: any) => canManageTenants ? (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-tenant-${item._id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-manage-tenant-${item._id}`}>
                          Manage
                        </Button>
                      </div>
                    ) : null,
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
