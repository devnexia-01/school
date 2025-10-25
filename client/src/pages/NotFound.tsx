import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">404</h1>
          <p className="text-xl font-medium">Page Not Found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link href="/dashboard">
          <Button data-testid="button-back-home">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
