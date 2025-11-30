import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi } from '../services/api';
import type { LeaderboardEntry } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.userId === user?.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-8 text-center">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {entry.username}
                          {entry.userId === user?.id && (
                            <span className="ml-2 text-sm text-primary">
                              (Du)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="text-xl font-bold">{entry.count}</span>
                      <span className="text-muted-foreground">
                        Kennzeichen
                      </span>
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

