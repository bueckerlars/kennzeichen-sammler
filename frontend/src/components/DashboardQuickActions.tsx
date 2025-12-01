import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { List, Trophy } from 'lucide-react';

export function DashboardQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mb-6 md:mb-8">
      <Card
        className="cursor-pointer min-h-[44px] touch-manipulation"
        onClick={() => navigate('/collection')}
        data-onboarding="collection"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Meine Sammlung
          </CardTitle>
          <CardDescription>
            Alle gesammelten Kennzeichen anzeigen
          </CardDescription>
        </CardHeader>
      </Card>

      <Card
        className="cursor-pointer min-h-[44px] touch-manipulation"
        onClick={() => navigate('/leaderboard')}
        data-onboarding="leaderboard"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bestenliste
          </CardTitle>
          <CardDescription>
            Rangliste aller Sammler
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

