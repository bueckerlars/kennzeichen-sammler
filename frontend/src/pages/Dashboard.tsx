import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsApi } from '../services/api';
import type { Statistics } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserMenu } from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { Search, List, Trophy } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await statisticsApi.getUserStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Willkommen, {user?.username}</p>
          </div>
          <UserMenu />
        </div>

        {statistics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Gesamt</CardTitle>
                <CardDescription>Alle deutschen Kennzeichen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gesammelt</CardTitle>
                <CardDescription>Deine Sammlung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {statistics.collected}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fehlend</CardTitle>
                <CardDescription>Noch zu sammeln</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {statistics.missing}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fortschritt</CardTitle>
                <CardDescription>Prozentual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statistics.percentage.toFixed(1)}%
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${statistics.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/search')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Suche
              </CardTitle>
              <CardDescription>
                Kennzeichen suchen und zur Sammlung hinzufügen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/collection')}>
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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leaderboard')}>
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

        {statistics && statistics.byState.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statistiken nach Bundesland</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Bundesland</th>
                      <th className="text-right p-2">Gesamt</th>
                      <th className="text-right p-2">Gesammelt</th>
                      <th className="text-right p-2">Fehlend</th>
                      <th className="text-right p-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.byState.map((state) => (
                      <tr key={state.state} className="border-b">
                        <td className="p-2">{state.state}</td>
                        <td className="text-right p-2">{state.total}</td>
                        <td className="text-right p-2 text-green-600">
                          {state.collected}
                        </td>
                        <td className="text-right p-2 text-orange-600">
                          {state.missing}
                        </td>
                        <td className="text-right p-2">
                          {state.total > 0
                            ? ((state.collected / state.total) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

