import type { OnboardingStep } from '../context/OnboardingContext';

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'dashboard-overview',
    title: 'Willkommen beim Kennzeichen-Sammler!',
    description: 'Hier siehst du deine Statistiken auf einen Blick: Gesamtanzahl aller deutschen Kennzeichen, wie viele du bereits gesammelt hast, wie viele noch fehlen und deinen Fortschritt in Prozent.',
    selector: '[data-onboarding="statistics"]',
    position: 'bottom',
  },
  {
    id: 'search-function',
    title: 'Kennzeichen suchen',
    description: 'Nutze die Suchleiste, um nach Kennzeichen zu suchen. Du kannst nach Code, Stadt oder Bundesland suchen. Gefundene Kennzeichen kannst du direkt zu deiner Sammlung hinzufügen.',
    selector: '[data-onboarding="search"]',
    position: 'bottom',
  },
  {
    id: 'collection',
    title: 'Meine Sammlung',
    description: 'Hier findest du alle Kennzeichen, die du bereits gesammelt hast. Du kannst sie durchsuchen, filtern und verwalten.',
    selector: '[data-onboarding="collection"]',
    position: 'top',
  },
  {
    id: 'leaderboard',
    title: 'Bestenliste',
    description: 'Vergleiche deine Sammlung mit anderen Sammlern und sehe, wer die meisten Kennzeichen gesammelt hat. Versuche, ganz oben zu stehen!',
    selector: '[data-onboarding="leaderboard"]',
    position: 'top',
  },
  {
    id: 'user-menu',
    title: 'Benutzermenü',
    description: 'Über dein Profilbild kannst du das Theme ändern, das Onboarding erneut starten oder dich abmelden.',
    selector: '[data-onboarding="user-menu"]',
    position: 'left',
  },
];

