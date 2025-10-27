import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Bus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrencyINR } from '@/lib/utils';

export default function Transport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);

  const canManageTransport = user && ['admin'].includes(user.role);

  const routes = [
    {
      id: '1',
      routeName: 'Route A - North Zone',
      routeNumber: 'RT-001',
      driverName: 'John Smith',
      driverPhone: '+1-555-1001',
      vehicleNumber: 'SCH-BUS-01',
      capacity: 45,
      occupancy: 38,
      fare: 50,
      stops: 'Main Street, Park Avenue, Hill Road, School Gate',
      status: 'active',
    },
    {
      id: '2',
      routeName: 'Route B - South Zone',
      routeNumber: 'RT-002',
      driverName: 'Mike Johnson',
      driverPhone: '+1-555-1002',
      vehicleNumber: 'SCH-BUS-02',
      capacity: 45,
      occupancy: 42,
      fare: 50,
      stops: 'Lake View, Shopping Mall, Central Park, School Gate',
      status: 'active',
    },
    {
      id: '3',
      routeName: 'Route C - East Zone',
      routeNumber: 'RT-003',
      driverName: 'Robert Brown',
      driverPhone: '+1-555-1003',
      vehicleNumber: 'SCH-BUS-03',
      capacity: 50,
      occupancy: 35,
      fare: 45,
      stops: 'Station Road, Industrial Area, River Side, School Gate',
      status: 'active',
    },
  ];

  const studentAllocations = [
    { id: '1', studentName: 'Sarah Johnson', rollNumber: '15', class: '10-A', route: 'Route A - North Zone', pickupStop: 'Main Street', status: 'active' },
    { id: '2', studentName: 'Michael Chen', rollNumber: '08', class: '10-A', route: 'Route A - North Zone', pickupStop: 'Park Avenue', status: 'active' },
    { id: '3', studentName: 'Emma Williams', rollNumber: '22', class: '9-B', route: 'Route B - South Zone', pickupStop: 'Lake View', status: 'active' },
    { id: '4', studentName: 'James Brown', rollNumber: '12', class: '10-A', route: 'Route C - East Zone', pickupStop: 'Station Road', status: 'active' },
  ];

  const handleAddRoute = () => {
    toast({
      title: 'Route Added',
      description: 'New transport route has been added successfully.',
    });
    setIsAddRouteDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <Breadcrumb items={[{ label: 'Transport Management' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Transport Management</h1>
            <p className="text-muted-foreground mt-1">Manage school transport routes and student allocations</p>
          </div>
          {canManageTransport && (
            <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-route">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Route
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Transport Route</DialogTitle>
                  <DialogDescription>Enter the details of the new transport route</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="routeName">Route Name</Label>
                    <Input id="routeName" placeholder="Route A - North Zone" data-testid="input-route-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routeNumber">Route Number</Label>
                    <Input id="routeNumber" placeholder="RT-001" data-testid="input-route-number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input id="vehicleNumber" placeholder="SCH-BUS-01" data-testid="input-vehicle-number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" type="number" placeholder="45" data-testid="input-capacity" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input id="driverName" placeholder="John Smith" data-testid="input-driver-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverPhone">Driver Phone</Label>
                    <Input id="driverPhone" placeholder="+1-555-0000" data-testid="input-driver-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fare">Monthly Fare (₹)</Label>
                    <Input id="fare" type="number" placeholder="50" data-testid="input-fare" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="stops">Stops (comma separated)</Label>
                    <Input id="stops" placeholder="Main Street, Park Avenue, Hill Road" data-testid="input-stops" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRouteDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoute} data-testid="button-save-route">
                    Add Route
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="routes" data-testid="tab-routes">Routes</TabsTrigger>
            <TabsTrigger value="allocations" data-testid="tab-allocations">Student Allocations</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transport Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={routes}
                  emptyMessage="No routes found"
                  columns={[
                    {
                      key: 'route',
                      header: 'Route Details',
                      cell: (item) => (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.routeName}</p>
                            <p className="text-sm text-muted-foreground">{item.routeNumber}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'vehicle',
                      header: 'Vehicle',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.vehicleNumber}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {item.capacity}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'driver',
                      header: 'Driver',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.driverName}</p>
                          <p className="text-sm text-muted-foreground">{item.driverPhone}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'occupancy',
                      header: 'Occupancy',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.occupancy}/{item.capacity}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((item.occupancy / item.capacity) * 100)}% filled
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'fare',
                      header: 'Fare',
                      cell: (item) => `${formatCurrencyINR(item.fare)}/month`,
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
                      cell: (item) => canManageTransport ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" data-testid={`button-edit-route-${item.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-delete-route-${item.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : null,
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student Transport Allocations</CardTitle>
                  {canManageTransport && (
                    <Button size="sm" data-testid="button-allocate-student">
                      <Plus className="mr-2 h-4 w-4" />
                      Allocate Student
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={studentAllocations}
                  emptyMessage="No student allocations found"
                  columns={[
                    {
                      key: 'student',
                      header: 'Student',
                      cell: (item) => (
                        <div>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            Roll: {item.rollNumber} • {item.class}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'route',
                      header: 'Route',
                      cell: (item) => item.route,
                    },
                    {
                      key: 'pickupStop',
                      header: 'Pickup Stop',
                      cell: (item) => item.pickupStop,
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
                      cell: (item) => canManageTransport ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" data-testid={`button-edit-allocation-${item.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-remove-allocation-${item.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : null,
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
