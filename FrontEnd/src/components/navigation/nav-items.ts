import {
  Activity,
  CalendarDays,
  ChartColumn,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/router/paths';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Shown directly in the mobile bottom bar (the rest lives under « Plus »). */
  mobilePrimary?: boolean;
  /** Other sections that belong to this item (keeps it highlighted). */
  alsoActiveOn?: string[];
}

export const isNavItemActive = (item: NavItem, pathname: string) =>
  item.to === '/'
    ? pathname === '/'
    : [item.to, ...(item.alsoActiveOn ?? [])].some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );

export const mainNavItems: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, mobilePrimary: true },
  {
    label: 'Entraînements',
    to: paths.workouts,
    icon: Dumbbell,
    mobilePrimary: true,
    alsoActiveOn: [paths.exercises],
  },
  { label: 'Activités', to: paths.activities, icon: Activity, mobilePrimary: true },
  { label: 'Progression', to: paths.progress, icon: TrendingUp, mobilePrimary: true },
  { label: 'Objectifs', to: paths.goals, icon: Target },
  { label: 'Statistiques', to: paths.statistics, icon: ChartColumn },
  { label: 'Calendrier', to: paths.calendar, icon: CalendarDays },
  { label: 'Défis', to: paths.challenges, icon: Trophy },
];

export const accountNavItems: NavItem[] = [
  { label: 'Profil', to: paths.profile, icon: UserRound },
  { label: 'Paramètres', to: paths.settings, icon: Settings },
];

export const allNavItems = [...mainNavItems, ...accountNavItems];
export const mobilePrimaryItems = mainNavItems.filter((item) => item.mobilePrimary);
export const mobileSecondaryItems = allNavItems.filter((item) => !item.mobilePrimary);
