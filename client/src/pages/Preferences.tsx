import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Globe, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Preferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: preferences, isLoading } = useQuery<any>({
    queryKey: ['/api/preferences'],
  });

  const [formData, setFormData] = useState({
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        theme: preferences.theme || 'system',
        emailNotifications: preferences.emailNotifications !== false,
        pushNotifications: preferences.pushNotifications !== false,
      });
    }
  }, [preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl space-y-6">
        <Breadcrumb items={[{ label: 'Preferences' }]} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Preferences</h1>
            <p className="text-muted-foreground mt-1">Customize your experience</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/dashboard')}
            data-testid="button-go-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                data-testid="switch-email-notifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser
                </p>
              </div>
              <Switch
                id="pushNotifications"
                data-testid="switch-push-notifications"
                checked={formData.pushNotifications}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, pushNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData({ ...formData, theme: value })}
              >
                <SelectTrigger id="theme" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" data-testid="button-save-preferences" disabled={updatePreferencesMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
      </div>
    </AppLayout>
  );
}
