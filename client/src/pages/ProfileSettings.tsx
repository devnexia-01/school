import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Users, Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function ProfileSettings() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery<any>({
    queryKey: user?.role === 'student' ? ['/api/student/profile'] : ['/api/profile'],
  });

  const profile = user?.role === 'student' ? profileData?.user : profileData;
  const student = profileData?.student;

  const getInitials = () => {
    if (profile) {
      return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl space-y-6">
        <Breadcrumb items={[{ label: 'Profile Settings' }]} />
        
        <div>
          <h1 className="text-3xl font-semibold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">View your personal information</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your avatar</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium" data-testid="text-profile-name">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{profile?.role?.replace('_', ' ').toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'student' && student && (
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>Your admission and academic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionNumber">Admission Number</Label>
                    <Input
                      id="admissionNumber"
                      value={student.admissionNumber || 'N/A'}
                      disabled
                      className="bg-muted"
                      data-testid="input-admission-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      value={student.rollNumber || 'N/A'}
                      disabled
                      className="bg-muted"
                      data-testid="input-roll-number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dob"
                        value={
                          student.dateOfBirth
                            ? format(new Date(student.dateOfBirth), 'MMM dd, yyyy')
                            : 'N/A'
                        }
                        disabled
                        className="pl-10 bg-muted"
                        data-testid="input-dob"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={student.gender || 'N/A'}
                      disabled
                      className="bg-muted"
                      data-testid="input-gender"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      value={student.bloodGroup || 'N/A'}
                      disabled
                      className="bg-muted"
                      data-testid="input-blood-group"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      value={
                        student.admissionDate
                          ? format(new Date(student.admissionDate), 'MMM dd, yyyy')
                          : 'N/A'
                      }
                      disabled
                      className="bg-muted"
                      data-testid="input-admission-date"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={profile?.firstName || ''}
                      disabled
                      className="pl-10 bg-muted"
                      data-testid="input-first-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={profile?.lastName || ''}
                      disabled
                      className="pl-10 bg-muted"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="pl-10 bg-muted"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone || 'Not provided'}
                    disabled
                    className="pl-10 bg-muted"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'student' && student && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parent/Guardian Information
                  </CardTitle>
                  <CardDescription>Emergency contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        value={student.fatherName || 'Not provided'}
                        disabled
                        className="bg-muted"
                        data-testid="input-father-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        value={student.motherName || 'Not provided'}
                        disabled
                        className="bg-muted"
                        data-testid="input-mother-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentContact">Parent Contact</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="parentContact"
                          value={student.parentContact || 'Not provided'}
                          disabled
                          className="pl-10 bg-muted"
                          data-testid="input-parent-contact"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="emergencyContact"
                          value={student.emergencyContact || 'Not provided'}
                          disabled
                          className="pl-10 bg-muted"
                          data-testid="input-emergency-contact"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {student.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Address
                    </CardTitle>
                    <CardDescription>Residential address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={student.address}
                      disabled
                      className="bg-muted"
                      data-testid="input-address"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>System assigned details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={profile?.role?.replace('_', ' ').toUpperCase() || ''}
                  disabled
                  className="bg-muted"
                  data-testid="input-role"
                />
                <p className="text-sm text-muted-foreground">
                  Role is assigned by administrators and cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
