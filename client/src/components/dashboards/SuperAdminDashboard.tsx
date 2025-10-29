import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, IndianRupee, TrendingUp, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrencyINR } from '@/lib/utils';

export function SuperAdminDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const { data: tenantsData, isLoading } = useQuery<{ tenants: Array<any> }>({
    queryKey: ['/api/tenants/with-stats'],
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery<{
    totalSchools: number;
    totalUsers: number;
    totalMRR: number;
  }>({
    queryKey: ['/api/dashboard/superadmin/stats'],
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; email: string; phone?: string; address?: string }) => {
      return await apiRequest('/api/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: 'School Added',
        description: `${schoolName} has been added successfully`,
      });
      setIsDialogOpen(false);
      setSchoolName('');
      setSchoolCode('');
      setEmail('');
      setPhone('');
      setAddress('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add school',
        variant: 'destructive',
      });
    },
  });

  const handleAddSchool = async () => {
    if (!schoolName || !schoolCode || !email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createSchoolMutation.mutate({
      name: schoolName,
      code: schoolCode,
      email,
      phone,
      address,
    });
  };

  const schools = (tenantsData?.tenants || []).map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    students: tenant.students || 0,
    plan: tenant.plan || 'Standard',
    status: tenant.status || 'active',
    revenue: formatCurrencyINR(tenant.revenue || 0),
  }));

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide analytics and school management</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-school">
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-school">
            <DialogHeader data-testid="dialog-header-add-school">
              <DialogTitle data-testid="dialog-title-add-school">Add New School</DialogTitle>
              <DialogDescription data-testid="dialog-description-add-school">
                Enter the details of the new school to onboard them to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name *</Label>
                <Input
                  id="schoolName"
                  placeholder="Enter school name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  data-testid="input-school-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolCode">School Code *</Label>
                <Input
                  id="schoolCode"
                  placeholder="e.g., SHS001"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  data-testid="input-school-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="school@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-school-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1-555-0100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-school-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="School address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  data-testid="input-school-address"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-school">
                Cancel
              </Button>
              <Button onClick={handleAddSchool} disabled={createSchoolMutation.isPending} data-testid="button-submit-school">
                {createSchoolMutation.isPending ? 'Adding...' : 'Add School'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Schools"
          value={isStatsLoading ? '...' : (stats?.totalSchools?.toString() || '0')}
          icon={Building2}
          testId="stat-total-schools"
        />
        <StatCard
          title="Total Users"
          value={isStatsLoading ? '...' : (stats?.totalUsers?.toString() || '0')}
          icon={Users}
          testId="stat-total-users"
        />
        <StatCard
          title="MRR"
          value={isStatsLoading ? '...' : (stats?.totalMRR ? formatCurrencyINR(stats.totalMRR) : formatCurrencyINR(0))}
          icon={IndianRupee}
          testId="stat-mrr"
        />
        <StatCard
          title="Total Revenue"
          value={isStatsLoading ? '...' : (stats?.totalMRR ? formatCurrencyINR(stats.totalMRR) : formatCurrencyINR(0))}
          icon={TrendingUp}
          testId="stat-growth-rate"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools Overview</CardTitle>
          <CardDescription>All schools on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={schools}
            isLoading={isLoading}
            emptyMessage="No schools found"
            columns={[
              {
                key: 'name',
                header: 'School Name',
                cell: (item) => (
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.students} students</p>
                  </div>
                ),
              },
              {
                key: 'plan',
                header: 'Plan',
                cell: (item) => <Badge variant="outline">{item.plan}</Badge>,
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
                key: 'revenue',
                header: 'Monthly Revenue',
                cell: (item) => <span className="font-mono font-medium">{item.revenue}</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
                cell: () => (
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                ),
              },
            ]}
            testId="schools-table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
