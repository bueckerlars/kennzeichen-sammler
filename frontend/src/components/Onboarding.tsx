import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useUserMenu } from '../context/UserMenuContext';
import { onboardingSteps } from '../config/onboardingSteps';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../lib/utils';

export function Onboarding() {
  const {
    isActive,
    currentStep,
    startOnboarding,
    endOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    isCompleted,
  } = useOnboarding();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setMobileSheetOpen, setDesktopMenuOpen, mobileSheetOpen, desktopMenuOpen } = useUserMenu();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wasActiveRef = useRef(false);

  // Initialize steps when component mounts
  useEffect(() => {
    if (isActive && onboardingSteps.length > 0) {
      // Steps are already defined in config
    }
  }, [isActive]);

  // Navigate to dashboard when onboarding ends
  useEffect(() => {
    // Track if onboarding was active
    if (isActive) {
      wasActiveRef.current = true;
    }
    
    // If onboarding was active and is now inactive, navigate to dashboard
    if (wasActiveRef.current && !isActive) {
      wasActiveRef.current = false;
      const currentPath = window.location.pathname;
      if (currentPath !== '/dashboard' && currentPath !== '/') {
        navigate('/dashboard');
      }
    }
  }, [isActive, navigate]);

  // Handle navigation and menu opening based on step
  useEffect(() => {
    if (!isActive || currentStep >= onboardingSteps.length) {
      return;
    }

    const step = onboardingSteps[currentStep];
    if (!step) return;

    // Navigate to appropriate page or open menu
    const timer = setTimeout(() => {
      if (step.id === 'collection') {
        navigate('/collection');
      } else if (step.id === 'leaderboard') {
        navigate('/leaderboard');
      } else if (step.id === 'user-menu') {
        // Open the user menu (mobile or desktop)
        if (isMobile) {
          setMobileSheetOpen(true);
        } else {
          setDesktopMenuOpen(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, navigate, isMobile, setMobileSheetOpen, setDesktopMenuOpen]);

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || currentStep >= onboardingSteps.length) {
      setTargetElement(null);
      setSpotlightRect(null);
      setTooltipPosition(null);
      return;
    }

    const step = onboardingSteps[currentStep];
    if (!step) return;

    // Wait a bit for DOM to be ready (longer delay if navigation happened or menu needs to open)
    const delay = step.id === 'collection' || step.id === 'leaderboard' ? 500 : step.id === 'user-menu' ? 600 : 100;
    const timer = setTimeout(() => {
      let element: HTMLElement | null = null;
      
      // For user-menu step, try to find the opened sheet/dropdown first
      if (step.id === 'user-menu') {
        if (isMobile && mobileSheetOpen) {
          // Try to find the opened sheet
          element = document.querySelector('[data-onboarding="user-menu-sheet"]') as HTMLElement;
        } else if (!isMobile && desktopMenuOpen) {
          // Try to find the opened dropdown
          element = document.querySelector('[data-onboarding="user-menu-dropdown"]') as HTMLElement;
        }
        // Fallback to avatar button if sheet/dropdown not found or not open
        if (!element) {
          element = document.querySelector(step.selector) as HTMLElement;
        }
      } else {
        element = document.querySelector(step.selector) as HTMLElement;
      }
      
      if (element) {
        setTargetElement(element);
        // For opened sheet/dropdown, use a special position that triggers centering
        const position = (step.id === 'user-menu' && element.hasAttribute('data-onboarding') && 
          (element.getAttribute('data-onboarding')?.includes('sheet') || element.getAttribute('data-onboarding')?.includes('dropdown'))) 
          ? 'bottom' // This will trigger the centering logic in updatePositions
          : step.position;
        updatePositions(element, position);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, isMobile, mobileSheetOpen, desktopMenuOpen]);

  // Update positions on scroll/resize
  useEffect(() => {
    if (!targetElement || !isActive) return;

    const updatePositionsHandler = () => {
      updatePositions(targetElement, onboardingSteps[currentStep]?.position || 'bottom');
    };

    window.addEventListener('scroll', updatePositionsHandler, true);
    window.addEventListener('resize', updatePositionsHandler);

    return () => {
      window.removeEventListener('scroll', updatePositionsHandler, true);
      window.removeEventListener('resize', updatePositionsHandler);
    };
  }, [targetElement, isActive, currentStep]);

  const updatePositions = useCallback((element: HTMLElement, position: 'top' | 'bottom' | 'left' | 'right') => {
    const rect = element.getBoundingClientRect();
    setSpotlightRect(rect);

    // Calculate tooltip position
    const tooltipWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 320;
    const tooltipHeight = 200;
    const spacing = 20;
    let top = 0;
    let left = 0;

    // Special handling for user-menu sheet/dropdown - center horizontally
    const isUserMenuSheet = element.hasAttribute('data-onboarding') && 
      (element.getAttribute('data-onboarding')?.includes('sheet') || element.getAttribute('data-onboarding')?.includes('dropdown'));

    if (isUserMenuSheet) {
      // Center horizontally within the viewport
      left = (window.innerWidth - tooltipWidth) / 2;
      // Position vertically centered or slightly above center
      top = Math.max(16, (window.innerHeight - tooltipHeight) / 2);
    } else {
      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - spacing;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - spacing;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + spacing;
          break;
      }

      // Adjust for mobile
      if (isMobile) {
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        if (position === 'top' && top < 16) {
          top = rect.bottom + spacing;
        }
        if (position === 'bottom' && top + tooltipHeight > window.innerHeight - 16) {
          top = rect.top - tooltipHeight - spacing;
        }
      } else {
        // Keep tooltip within viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
      }
    }

    setTooltipPosition({ top, left });
  }, [isMobile]);

  if (!isActive || currentStep >= onboardingSteps.length) {
    return null;
  }

  const step = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  // Create clip-path for spotlight effect
  const getClipPath = () => {
    if (!spotlightRect) return 'none';
    
    const padding = 8;
    const x = spotlightRect.left - padding;
    const y = spotlightRect.top - padding;
    const width = spotlightRect.width + padding * 2;
    const height = spotlightRect.height + padding * 2;

    return `polygon(
      0% 0%,
      0% 100%,
      ${x}px 100%,
      ${x}px ${y}px,
      ${x + width}px ${y}px,
      ${x + width}px ${y + height}px,
      ${x}px ${y + height}px,
      ${x}px 100%,
      100% 100%,
      100% 0%
    )`;
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay with spotlight */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{
          clipPath: getClipPath(),
          WebkitClipPath: getClipPath(),
        }}
      />
      
      {/* Highlight border around target */}
      {targetElement && spotlightRect && (
        <div
          className="absolute pointer-events-none border-2 border-primary rounded-2xl shadow-[0_0_0_4px_rgba(0,0,0,0.3),0_0_20px_rgba(var(--primary),0.5)] transition-all duration-300"
          style={{
            left: `${spotlightRect.left - 8}px`,
            top: `${spotlightRect.top - 8}px`,
            width: `${spotlightRect.width + 16}px`,
            height: `${spotlightRect.height + 16}px`,
          }}
        />
      )}

      {/* Tooltip Card */}
      {step && tooltipPosition && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute glass-strong rounded-3xl shadow-2xl p-6 pointer-events-auto",
            "animate-liquid-transition",
            isMobile ? "w-[calc(100vw-32px)] max-w-sm" : "w-80"
          )}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index <= currentStep
                    ? "bg-primary flex-1"
                    : "bg-muted/50 flex-1"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousStep}
                    className="min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={skipOnboarding}
                  className="min-h-[44px] touch-manipulation"
                >
                  Überspringen
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={isLastStep ? endOnboarding : nextStep}
                  className="min-h-[44px] touch-manipulation"
                >
                  {isLastStep ? 'Fertig' : 'Weiter'}
                  {!isLastStep && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <div className="text-xs text-center text-foreground/70 pt-2">
              Schritt {currentStep + 1} von {onboardingSteps.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

