import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  testId?: string;
}

export function StatCard({ title, value, icon: Icon, trend, testId }: StatCardProps) {
  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold" data-testid={`${testId}-value`}>{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
