import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SuperAdminDashboard() {
  const schools = [
    { id: '1', name: 'Springfield High School', students: 1248, plan: 'Premium', status: 'active', revenue: '$2,450' },
    { id: '2', name: 'Riverside Academy', students: 856, plan: 'Standard', status: 'active', revenue: '$1,820' },
    { id: '3', name: 'Oak Valley School', students: 642, plan: 'Basic', status: 'active', revenue: '$980' },
    { id: '4', name: 'Maple Leaf International', students: 1520, plan: 'Enterprise', status: 'active', revenue: '$4,200' },
    { id: '5', name: 'Sunrise Elementary', students: 445, plan: 'Standard', status: 'trial', revenue: '$0' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide analytics and school management</p>
        </div>
        <Button data-testid="button-add-school">
          <Plus className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Schools"
          value="24"
          icon={Building2}
          trend={{ value: 12.5, label: 'vs last month', isPositive: true }}
          testId="stat-total-schools"
        />
        <StatCard
          title="Total Users"
          value="15,248"
          icon={Users}
          trend={{ value: 8.2, label: 'vs last month', isPositive: true }}
          testId="stat-total-users"
        />
        <StatCard
          title="MRR"
          value="$42,850"
          icon={DollarSign}
          trend={{ value: 15.3, label: 'vs last month', isPositive: true }}
          testId="stat-mrr"
        />
        <StatCard
          title="Growth Rate"
          value="18.4%"
          icon={TrendingUp}
          trend={{ value: 2.1, label: 'vs last month', isPositive: true }}
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
