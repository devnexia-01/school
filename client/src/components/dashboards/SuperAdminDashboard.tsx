import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { PaymentTracking } from '@/components/dashboards/PaymentTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, IndianRupee, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrencyINR } from '@/lib/utils';

export function SuperAdminDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
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

  const { data: selectedSchoolData, isLoading: isSchoolDetailsLoading } = useQuery<{
    tenant: any;
    stats: {
      studentsCount: number;
      totalRevenue: number;
      paymentsCount: number;
    };
  }>({
    queryKey: ['/api/tenants', selectedSchoolId],
    enabled: !!selectedSchoolId && isManageDialogOpen,
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

  const handleManageSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setIsManageDialogOpen(true);
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
                cell: (item) => (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleManageSchool(item.id)}
                    data-testid={`button-manage-school-${item.id}`}
                  >
                    Manage
                  </Button>
                ),
              },
            ]}
            testId="schools-table"
          />
        </CardContent>
      </Card>

      <PaymentTracking />

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage School</DialogTitle>
            <DialogDescription>
              View and manage school details and statistics
            </DialogDescription>
          </DialogHeader>
          {isSchoolDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedSchoolData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>School Name</Label>
                  <p className="mt-1 font-medium" data-testid="text-manage-school-name">{selectedSchoolData.tenant.name}</p>
                </div>
                <div>
                  <Label>School Code</Label>
                  <p className="mt-1 font-medium">{selectedSchoolData.tenant.code}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSchoolData.tenant.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSchoolData.tenant.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSchoolData.tenant.address || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold" data-testid="text-manage-students-count">{selectedSchoolData.stats.studentsCount}</p>
                        <p className="text-sm text-muted-foreground mt-1">Students</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold" data-testid="text-manage-revenue">{formatCurrencyINR(selectedSchoolData.stats.totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedSchoolData.stats.paymentsCount}</p>
                        <p className="text-sm text-muted-foreground mt-1">Payments</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Actions</h3>
                <div className="flex gap-2">
                  <Button variant="outline" data-testid="button-view-analytics">
                    View Analytics
                  </Button>
                  <Button 
                    variant={selectedSchoolData.tenant.status === 'active' ? 'destructive' : 'default'}
                    data-testid="button-toggle-status"
                  >
                    {selectedSchoolData.tenant.status === 'active' ? 'Deactivate' : 'Activate'} School
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsManageDialogOpen(false);
                setSelectedSchoolId(null);
              }}
              data-testid="button-close-manage-dialog"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
