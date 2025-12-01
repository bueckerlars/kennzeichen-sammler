import { Card, CardContent } from './ui/card';

interface EmptyStateProps {
  message: string;
  className?: string;
  useCard?: boolean;
}

export function EmptyState({
  message,
  className,
  useCard = true,
}: EmptyStateProps) {
  if (useCard) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          {message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`text-center py-8 text-muted-foreground ${className || ''}`}>
      {message}
    </div>
  );
}

