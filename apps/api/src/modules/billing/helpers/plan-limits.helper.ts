export interface PlanLimits {
  maxUsers: number;
  maxProjects: number;
  maxDocuments?: number;
  maxTasks?: number;
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const limits: Record<string, PlanLimits> = {
    STARTER: {
      maxUsers: 5,
      maxProjects: 10,
      maxDocuments: 100,
      maxTasks: 500,
    },
    PRO: {
      maxUsers: 25,
      maxProjects: 100,
      maxDocuments: 1000,
      maxTasks: 5000,
    },
    ENTERPRISE: {
      maxUsers: Infinity,
      maxProjects: Infinity,
      maxDocuments: Infinity,
      maxTasks: Infinity,
    },
  };

  return limits[plan || 'STARTER'] || limits.STARTER;
}

export function checkPlanLimit(
  current: number,
  limit: number,
): { allowed: boolean; message?: string } {
  if (limit === Infinity) {
    return { allowed: true };
  }

  if (current >= limit) {
    return {
      allowed: false,
      message: `Plan limit reached. Upgrade your plan to continue.`,
    };
  }

  return { allowed: true };
}
