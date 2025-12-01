import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi } from '../services/api';
import type { LeaderboardEntry } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, Trophy, Search, Eye, Medal, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import { MobileUserMenu } from '../components/MobileUserMenu';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPlates, setTotalPlates] = useState(0);
  const userEntryRef = useRef<HTMLDivElement>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await statisticsApi.getLeaderboard();
        setLeaderboard(data.entries);
        setTotalPlates(data.totalPlates);
        setFilteredLeaderboard(data.entries);
        
        // Find user rank
        const rank = data.entries.findIndex(e => e.userId === user?.id);
        setUserRank(rank >= 0 ? rank + 1 : null);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [user?.id]);

  const scrollToUser = () => {
    if (userEntryRef.current) {
      userEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Auto-scroll to user entry after data is loaded
  useEffect(() => {
    if (!loading && userEntryRef.current && userRank !== null) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToUser();
      }, 100);
    }
  }, [loading, userRank]);

  useEffect(() => {
    let filtered = [...leaderboard];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((entry) =>
        entry.username.toLowerCase().includes(query)
      );
    }

    // Always sort by rank (original order)
    filtered.sort((a, b) => {
      const indexA = leaderboard.findIndex(e => e.userId === a.userId);
      const indexB = leaderboard.findIndex(e => e.userId === b.userId);
      return indexA - indexB;
    });

    setFilteredLeaderboard(filtered);
  }, [searchQuery, leaderboard]);

  const handleUserClick = (userId: string) => {
    navigate(`/collection/${userId}?from=leaderboard`);
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) {
      return <Medal className="h-5 w-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Medal className="h-5 w-5 text-amber-600" />;
    }
    return null;
  };

  const getPercentage = (count: number) => {
    if (totalPlates === 0) return 0;
    return ((count / totalPlates) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'}`}>
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

        <Card className={`${isMobile ? 'mb-4' : 'mb-6'} w-full`} data-onboarding="leaderboard">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                <Trophy className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                Bestenliste
              </CardTitle>
              {isMobile && (
                <div className="shrink-0">
                  <MobileUserMenu />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className={isMobile ? 'p-3' : ''}>
            {/* User Rank Banner */}
            {userRank !== null && (
              <div className="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground">Dein Rang</div>
                      <div className="text-2xl font-bold text-primary">Platz {userRank}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollToUser}
                    className="shrink-0"
                  >
                    Zu meinem Rang
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nach Username suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Tippe auf einen Eintrag oder den Button, um die Sammlung anzusehen
              </p>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Einträge in der Bestenliste
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Keine Ergebnisse gefunden
              </div>
            ) : (
              <div className={`space-y-2 ${isMobile ? 'space-y-3' : ''}`}>
                {filteredLeaderboard.map((entry) => {
                  const originalIndex = leaderboard.findIndex(e => e.userId === entry.userId);
                  const rank = originalIndex + 1;
                  const isUserEntry = entry.userId === user?.id;
                  const percentage = getPercentage(entry.count);
                  
                  return (
                    <div
                      key={entry.userId}
                      ref={isUserEntry ? userEntryRef : null}
                      onClick={() => handleUserClick(entry.userId)}
                      className={`relative flex items-center justify-between ${isMobile ? 'p-3 min-h-[60px]' : 'p-4'} rounded-2xl border touch-manipulation transition-all duration-300 cursor-pointer hover:bg-primary/5 group ${
                        isUserEntry
                          ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                          : 'bg-card/80 backdrop-blur-sm hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className={`${isMobile ? 'w-8' : 'w-10'} flex items-center justify-center shrink-0`}>
                          {rank <= 3 ? (
                            getMedalIcon(rank)
                          ) : (
                            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center`}>
                              {rank}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`${isMobile ? 'text-sm' : ''} font-semibold`}>
                            {entry.username}
                            {isUserEntry && (
                              <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'} text-primary`}>
                                (Du)
                              </span>
                            )}
                          </div>
                          {!isMobile && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {entry.count} / {totalPlates} ({percentage}%)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 shrink-0 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-2">
                            {rank === 1 && (
                              <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500 shrink-0`} />
                            )}
                            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>{entry.count}</span>
                            {!isMobile && (
                              <span className="text-muted-foreground text-sm">
                                Kennzeichen
                              </span>
                            )}
                          </div>
                          {isMobile && (
                            <div className="text-xs text-muted-foreground">
                              {entry.count} / {totalPlates} ({percentage}%)
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(entry.userId);
                        }}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMobile ? 'h-10 px-3' : ''} shrink-0 pointer-events-none group-hover:pointer-events-auto`}
                        aria-label={`Sammlung von ${entry.username} ansehen`}
                      >
                        <Eye className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
                        {!isMobile && (
                          <span className="text-sm">Ansehen</span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

