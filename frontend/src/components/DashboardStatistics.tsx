import { StatisticsCard } from './StatisticsCard';
import type { Statistics } from '../types';

interface DashboardStatisticsProps {
  statistics: Statistics;
  isMobile?: boolean;
}

export function DashboardStatistics({
  statistics,
  isMobile,
}: DashboardStatisticsProps) {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8" data-onboarding="statistics">
      <StatisticsCard
        title="Gesamt"
        description="Alle deutschen Kennzeichen"
        value={statistics.total}
        isMobile={isMobile}
      />
      <StatisticsCard
        title="Gesammelt"
        description="Deine Sammlung"
        value={statistics.collected}
        color="text-green-600"
        isMobile={isMobile}
      />
      <StatisticsCard
        title="Fehlend"
        description="Noch zu sammeln"
        value={statistics.missing}
        color="text-orange-600"
        isMobile={isMobile}
      />
      <StatisticsCard
        title="Fortschritt"
        description="Prozentual"
        value={`${statistics.percentage.toFixed(1)}%`}
        isMobile={isMobile}
        showProgress
        progressValue={statistics.percentage}
      />
    </div>
  );
}

