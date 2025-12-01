import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from './ui/sheet';
import { Button } from './ui/button';
import { Moon, Sun, Monitor, LogOut, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function MobileUserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
          <Avatar className="cursor-pointer hover:opacity-80 transition-opacity h-10 w-10 glass-strong border border-white/20 shadow-lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username ? getInitials(user.username) : 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        hideCloseButton
        className={cn(
          "w-[280px] sm:w-[320px] p-0 flex flex-col",
          "glass-fixed border-l-0 rounded-l-3xl"
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-left text-lg font-semibold flex-1">
              {user?.username || 'Benutzer'}
            </SheetTitle>
            <SheetClose asChild>
              <button className="rounded-full p-2 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="h-5 w-5 text-foreground" />
                <span className="sr-only">Schließen</span>
              </button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="px-6 py-4 space-y-2 flex-1">
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground mb-3">
              Theme
            </div>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className={cn(
                'w-full justify-start min-h-[44px] font-medium',
                theme === 'light' 
                  ? 'bg-primary text-primary-foreground shadow-lg border-2 border-primary' 
                  : 'bg-background/60 backdrop-blur-sm border-2 border-border text-foreground hover:bg-background/80 hover:border-primary/50'
              )}
              onClick={() => setTheme('light')}
            >
              <Sun className="mr-3 h-4 w-4" />
              <span>Light</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className={cn(
                'w-full justify-start min-h-[44px] font-medium',
                theme === 'dark' 
                  ? 'bg-primary text-primary-foreground shadow-lg border-2 border-primary' 
                  : 'bg-background/60 backdrop-blur-sm border-2 border-border text-foreground hover:bg-background/80 hover:border-primary/50'
              )}
              onClick={() => setTheme('dark')}
            >
              <Moon className="mr-3 h-4 w-4" />
              <span>Dark</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className={cn(
                'w-full justify-start min-h-[44px] font-medium',
                theme === 'system' 
                  ? 'bg-primary text-primary-foreground shadow-lg border-2 border-primary' 
                  : 'bg-background/60 backdrop-blur-sm border-2 border-border text-foreground hover:bg-background/80 hover:border-primary/50'
              )}
              onClick={() => setTheme('system')}
            >
              <Monitor className="mr-3 h-4 w-4" />
              <span>System</span>
            </Button>
          </div>
        </div>

        <div className="mt-auto px-6 pb-6 pt-4 border-t border-border/50 space-y-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Version {import.meta.env.VITE_APP_VERSION || '1.0.0'}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start min-h-[44px] font-medium bg-background/60 backdrop-blur-sm border-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Abmelden</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

