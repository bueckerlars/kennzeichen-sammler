import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi } from '../services/api';
import type { LeaderboardEntry } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await statisticsApi.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {!isMobile && (
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        )}

        <Card className={`${isMobile ? 'mb-4' : 'mb-6'} hover:shadow-xl transition-all duration-300`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-xl' : ''}`}>
              <Trophy className="h-5 w-5" />
              Bestenliste
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Einträge in der Bestenliste
              </div>
            ) : (
              <div className={`space-y-2 ${isMobile ? 'space-y-3' : ''}`}>
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between ${isMobile ? 'p-3 min-h-[60px]' : 'p-4'} rounded-2xl border touch-manipulation transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                      entry.userId === user?.id
                        ? 'bg-primary/10 border-primary shadow-md'
                        : 'bg-card/80 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`${isMobile ? 'text-xl w-6' : 'text-2xl w-8'} font-bold text-center`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className={`${isMobile ? 'text-sm' : ''} font-semibold`}>
                          {entry.username}
                          {entry.userId === user?.id && (
                            <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'} text-primary`}>
                              (Du)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />
                      )}
                      <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>{entry.count}</span>
                      {!isMobile && (
                        <span className="text-muted-foreground">
                          Kennzeichen
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

