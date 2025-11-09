import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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

const studentEditSchema = z.object({
  rollNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  parentContact: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type StudentEditFormData = z.infer<typeof studentEditSchema>;

export default function StudentEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['/api/students', id],
    enabled: !!id,
  });

  const form = useForm<StudentEditFormData>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: {
      rollNumber: '',
      bloodGroup: '',
      fatherName: '',
      motherName: '',
      parentContact: '',
      address: '',
      emergencyContact: '',
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        rollNumber: student.rollNumber || '',
        bloodGroup: student.bloodGroup || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        parentContact: student.parentContact || '',
        address: student.address || '',
        emergencyContact: student.emergencyContact || '',
      });
    }
  }, [student, form]);

  const updateStudentMutation = useMutation({
    mutationFn: (data: StudentEditFormData) =>
      apiRequest(`/api/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({ title: 'Success', description: 'Student updated successfully' });
      navigate(`/students/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: StudentEditFormData) => {
    updateStudentMutation.mutate(data);
  };

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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-4xl">
          <Breadcrumb items={[{ label: 'Students', href: '/students' }, { label: 'Edit Student' }]} />
          <Card>
            <CardHeader>
              <CardTitle>Student Not Found</CardTitle>
              <CardDescription>The student you are trying to edit does not exist.</CardDescription>
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <Breadcrumb 
          items={[
            { label: 'Students', href: '/students' }, 
            { label: student.admissionNumber, href: `/students/${id}` },
            { label: 'Edit' }
          ]} 
        />

        <div>
          <h1 className="text-3xl font-semibold">Edit Student</h1>
          <p className="text-muted-foreground mt-1">Update student information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Edit the fields you want to update</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter roll number" {...field} data-testid="input-roll-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., O+" {...field} data-testid="input-blood-group" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's name" {...field} data-testid="input-father-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's name" {...field} data-testid="input-mother-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact number" {...field} data-testid="input-parent-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact" {...field} data-testid="input-emergency-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/students/${id}`)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateStudentMutation.isPending}
                    data-testid="button-submit"
                  >
                    {updateStudentMutation.isPending ? 'Updating...' : 'Update Student'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
