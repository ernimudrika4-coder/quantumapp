export type PlanName = 'free' | 'pro' | 'elite';

export const PLAN_ORDER: Record<PlanName, number> = {
  free: 1,
  pro: 2,
  elite: 3,
};

export const PLAN_FEATURES = {
  free: {
    watchlistLimit: 3,
    pushNotifications: false,
    advancedPerformance: false,
    generatedSignalDetails: false,
  },
  pro: {
    watchlistLimit: 15,
    pushNotifications: true,
    advancedPerformance: true,
    generatedSignalDetails: true,
  },
  elite: {
    watchlistLimit: 50,
    pushNotifications: true,
    advancedPerformance: true,
    generatedSignalDetails: true,
  },
} as const;

export function normalizePlan(plan?: string): PlanName {
  if (plan === 'elite') return 'elite';
  if (plan === 'pro') return 'pro';
  return 'free';
}

export function hasRequiredPlan(current: string | undefined, required: PlanName) {
  return PLAN_ORDER[normalizePlan(current)] >= PLAN_ORDER[required];
}
