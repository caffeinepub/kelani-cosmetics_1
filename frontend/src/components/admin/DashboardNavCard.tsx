import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardNavCardProps {
  title: string;
  icon: LucideIcon;
  path: string;
}

export default function DashboardNavCard({
  title,
  icon: Icon,
  path,
}: DashboardNavCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
        'border-2 hover:border-primary/50'
      )}
      onClick={() => navigate({ to: path })}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardContent>
    </Card>
  );
}
