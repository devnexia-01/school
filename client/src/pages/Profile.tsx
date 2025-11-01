import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Bus, MapPin, IndianRupee, Calendar, Phone, Mail, UserCircle, GraduationCap } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Profile() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const { data: profileData, isLoading } = useQuery<{
    student: any;
    user: any;
    transport: any;
    fees: any;
  }>({
    queryKey: ['/api/student/profile'],
    enabled: !!isStudent,
  });

  if (!isStudent) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Profile page is only available for students</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-5xl">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const student = profileData?.student;
  const userInfo = profileData?.user;
  const transport = profileData?.transport;
  const fees = profileData?.fees;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <Breadcrumb items={[{ label: 'My Profile' }]} />

        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-profile-heading">Student Profile</h1>
          <p className="text-muted-foreground mt-1">
            View your personal information, transport details, and fee status
          </p>
        </div>

        {/* Personal Information Card */}
        <Card data-testid="card-personal-info">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your basic details and contact information
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold" data-testid="text-student-name">
                      {userInfo?.firstName} {userInfo?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Admission Number</p>
                    <p className="font-semibold" data-testid="text-admission-number">
                      {student?.admissionNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCircle className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold" data-testid="text-gender">
                      {student?.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'}
                    </p>
                  </div>
                </div>

                {student?.rollNumber && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="font-semibold" data-testid="text-roll-number">
                        {student.rollNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold" data-testid="text-email">
                      {userInfo?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                {userInfo?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold" data-testid="text-phone">
                        {userInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                {student?.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-semibold" data-testid="text-dob">
                        {format(new Date(student.dateOfBirth), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {student?.bloodGroup && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Group</p>
                      <p className="font-semibold" data-testid="text-blood-group">
                        {student.bloodGroup}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {student?.address && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold" data-testid="text-address">
                      {student.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(student?.fatherName || student?.motherName || student?.parentContact) && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-4">Parent/Guardian Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student?.fatherName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Father's Name</p>
                      <p className="font-semibold" data-testid="text-father-name">
                        {student.fatherName}
                      </p>
                    </div>
                  )}
                  {student?.motherName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mother's Name</p>
                      <p className="font-semibold" data-testid="text-mother-name">
                        {student.motherName}
                      </p>
                    </div>
                  )}
                  {student?.parentContact && (
                    <div>
                      <p className="text-sm text-muted-foreground">Parent Contact</p>
                      <p className="font-semibold" data-testid="text-parent-contact">
                        {student.parentContact}
                      </p>
                    </div>
                  )}
                  {student?.emergencyContact && (
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-semibold" data-testid="text-emergency-contact">
                        {student.emergencyContact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transport Details Card */}
        <Card data-testid="card-transport-info">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Transport Details</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your school transport assignment and route information
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transport ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Route Name</p>
                      <p className="font-semibold" data-testid="text-transport-route-name">
                        {transport.routeName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Route Number</p>
                      <p className="font-semibold" data-testid="text-transport-route-number">
                        {transport.routeNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Number</p>
                      <p className="font-semibold" data-testid="text-transport-vehicle">
                        {transport.vehicleNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {transport.pickupStop && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup Stop</p>
                        <p className="font-semibold" data-testid="text-transport-pickup">
                          {transport.pickupStop}
                        </p>
                      </div>
                    </div>
                  )}

                  {transport.dropStop && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Drop Stop</p>
                        <p className="font-semibold" data-testid="text-transport-drop">
                          {transport.dropStop}
                        </p>
                      </div>
                    </div>
                  )}

                  {transport.fare && (
                    <div className="flex items-start gap-3">
                      <IndianRupee className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Fare</p>
                        <p className="font-semibold" data-testid="text-transport-fare">
                          {formatCurrencyINR(transport.fare)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-transport">
                  No transport assignment found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You are not currently assigned to any transport route
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Summary Card */}
        <Card data-testid="card-fee-info">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Fee Summary</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your fee payment status and transaction history
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Fees</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400" data-testid="text-total-fees">
                  {formatCurrencyINR(fees?.totalFees || 0)}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-paid-fees">
                  {formatCurrencyINR(fees?.paidAmount || 0)}
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Pending Balance</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400" data-testid="text-pending-fees">
                  {formatCurrencyINR(fees?.pendingAmount || 0)}
                </p>
              </div>
            </div>

            {fees?.recentPayments && fees.recentPayments.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.recentPayments.map((payment: any, index: number) => (
                        <TableRow key={payment._id || index} data-testid={`row-payment-${payment._id}`}>
                          <TableCell data-testid={`text-payment-date-${payment._id}`}>
                            {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`text-payment-amount-${payment._id}`}>
                            {formatCurrencyINR(payment.amount)}
                          </TableCell>
                          <TableCell data-testid={`text-payment-mode-${payment._id}`}>
                            {payment.paymentMode}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'secondary'}
                              data-testid={`badge-payment-status-${payment._id}`}
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-payment-receipt-${payment._id}`}>
                            {payment.receiptNumber || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-payments">
                  No payment history found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment transactions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
