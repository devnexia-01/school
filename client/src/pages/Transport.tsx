import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, MapPin, Clock, Phone, User, IndianRupee } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

export default function Transport() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const canViewTransport = user && ['admin', 'principal', 'student'].includes(user.role);

  const { data: transportData, isLoading } = useQuery<{ transport?: any; routes?: any[] }>({
    queryKey: isStudent ? ['/api/student/transport'] : ['/api/transport/routes'],
    enabled: !!canViewTransport,
  });

  const transport = transportData?.transport;
  const routes = transportData?.routes || [];
  const route = transport?.routeId;

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

          <div>
            <h1 className="text-3xl font-semibold">Transport Routes</h1>
            <p className="text-muted-foreground mt-1">
              Manage all school transport routes and vehicles
            </p>
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
