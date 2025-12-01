import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { StateStatistics } from '../types';

interface DashboardStateListProps {
  states: StateStatistics[];
  isMobile?: boolean;
}

export function DashboardStateList({
  states,
  isMobile,
}: DashboardStateListProps) {
  const navigate = useNavigate();

  if (states.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiken nach Bundesland</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-3">
            {states.map((state, index) => {
              const percentage = state.total > 0
                ? ((state.collected / state.total) * 100).toFixed(1)
                : '0';
              return (
                <div
                  key={state.state}
                  className="glass-light rounded-2xl p-3 transition-colors duration-300 cursor-pointer hover:bg-muted/50 active:bg-muted touch-manipulation"
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                  onClick={() => navigate(`/state/${encodeURIComponent(state.state)}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate mb-1">{state.state}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>G: {state.total}</span>
                        <span className="text-green-600">✓ {state.collected}</span>
                        <span className="text-orange-600">✗ {state.missing}</span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-bold">{percentage}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 font-semibold">Bundesland</th>
                  <th className="text-right p-3 font-semibold">Gesamt</th>
                  <th className="text-right p-3 font-semibold">Gesammelt</th>
                  <th className="text-right p-3 font-semibold">Fehlend</th>
                  <th className="text-right p-3 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {states.map((state, index) => (
                  <tr
                    key={state.state}
                    className="border-b border-border/30 transition-colors duration-300 cursor-pointer hover:bg-muted/50"
                    style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                    onClick={() => navigate(`/state/${encodeURIComponent(state.state)}`)}
                  >
                    <td className="p-3">{state.state}</td>
                    <td className="text-right p-3">{state.total}</td>
                    <td className="text-right p-3 text-green-600 font-semibold">
                      {state.collected}
                    </td>
                    <td className="text-right p-3 text-orange-600 font-semibold">
                      {state.missing}
                    </td>
                    <td className="text-right p-3 font-semibold">
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
        )}
      </CardContent>
    </Card>
  );
}

