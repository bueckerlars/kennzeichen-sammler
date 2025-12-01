import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useIsMobile } from '../hooks/use-mobile';

interface StatisticsCardProps {
  title: string;
  description: string;
  value: string | number;
  color?: string;
  isMobile?: boolean;
  showProgress?: boolean;
  progressValue?: number;
}

export function StatisticsCard({
  title,
  description,
  value,
  color,
  isMobile: isMobileProp,
  showProgress = false,
  progressValue = 0,
}: StatisticsCardProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;

  if (isMobile) {
    return (
      <Card>
        <CardContent className="p-5">
          {showProgress ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold mb-1">{title}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
                <div className={`text-3xl font-bold ${color || ''}`}>{value}</div>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 backdrop-blur-sm">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">{title}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
              <div className={`text-3xl font-bold ${color || ''}`}>{value}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showProgress ? (
          <>
            <div className={`text-4xl font-bold mb-3 ${color || ''}`}>{value}</div>
            <div className="w-full bg-muted/50 rounded-full h-2.5 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </>
        ) : (
          <div className={`text-4xl font-bold ${color || ''}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

