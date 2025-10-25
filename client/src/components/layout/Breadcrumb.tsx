import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/dashboard" data-testid="breadcrumb-home">
        <a className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
          Dashboard
        </a>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href}>
              <a className="hover:text-foreground transition-colors" data-testid={`breadcrumb-${item.label.toLowerCase()}`}>
                {item.label}
              </a>
            </Link>
          ) : (
            <span className="text-foreground font-medium" data-testid={`breadcrumb-${item.label.toLowerCase()}`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
