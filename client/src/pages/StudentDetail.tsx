import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';

interface Student {
  _id: string;
  tenantId: string;
  userId: string;
  classId?: string;
  admissionNumber: string;
  rollNumber?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  parentId?: string;
  fatherName?: string;
  motherName?: string;
  parentContact?: string;
  address?: string;
  emergencyContact?: string;
  admissionDate: string;
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const canEdit = user && ['admin', 'principal'].includes(user.role);

  const { data: student, isLoading, error } = useQuery<Student>({
    queryKey: ['/api/students', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-4xl">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !student) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-4xl">
          <Breadcrumb items={[{ label: 'Students', href: '/students' }, { label: 'Student Details' }]} />
          <Card>
            <CardHeader>
              <CardTitle>Student Not Found</CardTitle>
              <CardDescription>The student you are looking for does not exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/students')} data-testid="button-back-to-students">
                Back to Students
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <Breadcrumb items={[{ label: 'Students', href: '/students' }, { label: 'Student Details' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Student Details</h1>
            <p className="text-muted-foreground mt-1">View student information and records</p>
          </div>
          {canEdit && (
            <Button asChild data-testid="button-edit-student">
              <Link href={`/students/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Student
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(student.admissionNumber)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle data-testid="text-student-admission-number">{student.admissionNumber}</CardTitle>
                <CardDescription>Admission Number</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Admission Number</p>
                  <p className="font-medium" data-testid="text-admission-number">{student.admissionNumber}</p>
                </div>
                {student.rollNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium" data-testid="text-roll-number">{student.rollNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium" data-testid="text-dob">
                    {format(new Date(student.dateOfBirth), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize" data-testid="text-gender">{student.gender}</p>
                </div>
                {student.bloodGroup && (
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium" data-testid="text-blood-group">{student.bloodGroup}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium" data-testid="text-admission-date">
                    {format(new Date(student.admissionDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.fatherName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-medium" data-testid="text-father-name">{student.fatherName}</p>
                  </div>
                )}
                {student.motherName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mother's Name</p>
                    <p className="font-medium" data-testid="text-mother-name">{student.motherName}</p>
                  </div>
                )}
                {student.parentContact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parent Contact</p>
                    <p className="font-medium" data-testid="text-parent-contact">{student.parentContact}</p>
                  </div>
                )}
                {student.emergencyContact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium" data-testid="text-emergency-contact">{student.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>

            {student.address && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <p className="text-muted-foreground" data-testid="text-address">{student.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
