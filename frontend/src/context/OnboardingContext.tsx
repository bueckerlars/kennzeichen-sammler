import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { onboardingSteps } from '../config/onboardingSteps';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  endOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  skipOnboarding: () => void;
  isCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);

  // Check if onboarding was completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setIsCompleted(completed);
  }, []);

  const startOnboarding = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!user || hasCheckedInitial || isCompleted) {
      return;
    }

    // Check if onboarding was completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (completed) {
      setIsCompleted(true);
      setHasCheckedInitial(true);
      return;
    }

    // Wait a bit for the page to load, then start onboarding
    const timer = setTimeout(() => {
      // Only start if we're on the dashboard (main page)
      if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
        startOnboarding();
      }
      setHasCheckedInitial(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, isCompleted, hasCheckedInitial, startOnboarding]);

  // Load steps dynamically (will be set by Onboarding component)
  const setOnboardingSteps = useCallback((newSteps: OnboardingStep[]) => {
    setSteps(newSteps);
  }, []);

  const endOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsCompleted(true);
  }, []);

  const skipOnboarding = useCallback(() => {
    endOnboarding();
  }, [endOnboarding]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < onboardingSteps.length - 1) {
        return prev + 1;
      } else {
        endOnboarding();
        return prev;
      }
    });
  }, [endOnboarding]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  // Expose setOnboardingSteps through context value
  const value: OnboardingContextType & { setOnboardingSteps?: (steps: OnboardingStep[]) => void } = {
    isActive,
    currentStep,
    steps,
    startOnboarding,
    endOnboarding,
    nextStep,
    previousStep,
    goToStep,
    skipOnboarding,
    isCompleted,
    setOnboardingSteps,
  };

  return (
    <OnboardingContext.Provider value={value as OnboardingContextType}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

