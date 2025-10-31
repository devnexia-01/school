import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, MapPin, Clock, Phone, User, IndianRupee, Plus } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Transport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isStudent = user?.role === 'student';
  const canViewTransport = user && ['admin', 'principal', 'student'].includes(user.role);
  const canManageTransport = user && ['admin', 'principal'].includes(user.role);
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeNumber: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    capacity: '',
    stops: '',
    fare: '',
  });

  const { data: transportData, isLoading } = useQuery<{ transport?: any; routes?: any[] }>({
    queryKey: isStudent ? ['/api/student/transport'] : ['/api/transport/routes'],
    enabled: !!canViewTransport,
  });

  const transport = transportData?.transport;
  const routes = transportData?.routes || [];
  const route = transport?.routeId;

  const createRouteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/transport/routes', {
        method: 'POST',
        body: JSON.stringify({
          ...routeForm,
          capacity: parseInt(routeForm.capacity) || 0,
          fare: parseFloat(routeForm.fare) || 0,
          active: true,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transport route created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transport/routes'] });
      setIsAddRouteDialogOpen(false);
      setRouteForm({
        routeName: '',
        routeNumber: '',
        vehicleNumber: '',
        driverName: '',
        driverPhone: '',
        capacity: '',
        stops: '',
        fare: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create transport route',
        variant: 'destructive',
      });
    },
  });

  const handleCreateRoute = () => {
    if (!routeForm.routeName || !routeForm.routeNumber) {
      toast({
        title: 'Error',
        description: 'Please fill in route name and number',
        variant: 'destructive',
      });
      return;
    }
    createRouteMutation.mutate();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-5xl">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  // Admin/Principal view - show all routes
  if (!isStudent) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-7xl">
          <Breadcrumb items={[{ label: 'Transport Management' }]} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Transport Routes</h1>
              <p className="text-muted-foreground mt-1">
                Manage all school transport routes and vehicles
              </p>
            </div>
            {canManageTransport && (
              <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-route">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Route
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Transport Route</DialogTitle>
                    <DialogDescription>Create a new transport route</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="route-name">Route Name *</Label>
                        <Input
                          id="route-name"
                          placeholder="Route A"
                          value={routeForm.routeName}
                          onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                          data-testid="input-route-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="route-number">Route Number *</Label>
                        <Input
                          id="route-number"
                          placeholder="R001"
                          value={routeForm.routeNumber}
                          onChange={(e) => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
                          data-testid="input-route-number"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-number">Vehicle Number</Label>
                        <Input
                          id="vehicle-number"
                          placeholder="DL-1AB-1234"
                          value={routeForm.vehicleNumber}
                          onChange={(e) => setRouteForm({ ...routeForm, vehicleNumber: e.target.value })}
                          data-testid="input-vehicle-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          placeholder="50"
                          value={routeForm.capacity}
                          onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })}
                          data-testid="input-capacity"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driver-name">Driver Name</Label>
                        <Input
                          id="driver-name"
                          placeholder="John Doe"
                          value={routeForm.driverName}
                          onChange={(e) => setRouteForm({ ...routeForm, driverName: e.target.value })}
                          data-testid="input-driver-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver-phone">Driver Phone</Label>
                        <Input
                          id="driver-phone"
                          placeholder="+91 98765 43210"
                          value={routeForm.driverPhone}
                          onChange={(e) => setRouteForm({ ...routeForm, driverPhone: e.target.value })}
                          data-testid="input-driver-phone"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stops">Stops (comma-separated)</Label>
                      <Textarea
                        id="stops"
                        placeholder="Stop 1, Stop 2, Stop 3"
                        rows={2}
                        value={routeForm.stops}
                        onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                        data-testid="textarea-stops"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fare">Monthly Fare</Label>
                      <Input
                        id="fare"
                        type="number"
                        placeholder="1000"
                        value={routeForm.fare}
                        onChange={(e) => setRouteForm({ ...routeForm, fare: e.target.value })}
                        data-testid="input-fare"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRouteDialogOpen(false)} data-testid="button-cancel-route">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRoute} disabled={createRouteMutation.isPending} data-testid="button-create-route">
                      {createRouteMutation.isPending ? 'Creating...' : 'Create Route'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Transport Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {routes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No transport routes configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routes.map((routeItem: any, index: number) => (
                    <Card key={routeItem._id || index}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Route Info</p>
                            <p className="font-semibold">{routeItem.routeName}</p>
                            <p className="text-sm text-muted-foreground">Route #{routeItem.routeNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle</p>
                            <p className="font-semibold">{routeItem.vehicleNumber || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Capacity: {routeItem.capacity || 'N/A'} seats</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Driver</p>
                            <p className="font-semibold">{routeItem.driverName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{routeItem.driverPhone || 'N/A'}</p>
                          </div>
                        </div>
                        {routeItem.stops && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-2">Stops</p>
                            <div className="flex flex-wrap gap-2">
                              {routeItem.stops.split(',').map((stop: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{stop.trim()}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-4">
                          <Badge variant={routeItem.active ? 'default' : 'secondary'}>
                            {routeItem.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {routeItem.fare && (
                            <span className="text-sm font-medium">{formatCurrencyINR(routeItem.fare)}/month</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Student view - show assigned transport
  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <Breadcrumb items={[{ label: 'Transport Management' }]} />

        <div>
          <h1 className="text-3xl font-semibold">Transport Details</h1>
          <p className="text-muted-foreground mt-1">
            Your school transport information and schedule
          </p>
        </div>

        {transport && route ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Bus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Assigned Route</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {route.routeName || 'Route Information'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bus className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bus Number</p>
                        <p className="font-semibold" data-testid="text-vehicle-number">
                          {route.vehicleNumber || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup Stop</p>
                        <p className="font-semibold" data-testid="text-pickup-stop">
                          {transport.pickupStop || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup Time</p>
                        <p className="font-semibold text-primary" data-testid="text-pickup-time">
                          {transport.pickupTime || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Driver</p>
                        <p className="font-semibold" data-testid="text-driver-name">
                          {route.driverName || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Contact</p>
                        <p className="font-semibold" data-testid="text-driver-phone">
                          {route.driverPhone || 'Not available'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Bus className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle Capacity</p>
                        <p className="font-semibold">
                          {route.capacity ? `${route.capacity} seats` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Route Details</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Complete route information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Route Number</p>
                    <Badge variant="outline" className="text-sm" data-testid="badge-route-number">
                      {route.routeNumber || 'N/A'}
                    </Badge>
                  </div>

                  {route.stops && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">All Stops</p>
                      <div className="flex flex-wrap gap-2">
                        {route.stops.split(',').map((stop: string, index: number) => (
                          <Badge
                            key={index}
                            variant={
                              stop.trim() === transport.pickupStop?.trim() ? 'default' : 'secondary'
                            }
                            className="text-sm"
                            data-testid={`stop-${index}`}
                          >
                            {stop.trim()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your stop is highlighted
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Badge
                      variant={transport.status === 'active' ? 'default' : 'secondary'}
                      data-testid="badge-transport-status"
                    >
                      {transport.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Fee Information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monthly transport charges
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold" data-testid="text-transport-fee">
                    {route.fare ? formatCurrencyINR(route.fare) : 'N/A'}
                  </p>
                  <p className="text-muted-foreground">per month</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Fee is included in your monthly school fee payment
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Bus className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Transport Allocated</h3>
                  <p className="text-muted-foreground mt-2">
                    You don't have any transport route assigned yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please contact the administration office if you need school transport services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
