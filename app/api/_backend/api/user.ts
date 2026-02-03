// backend/api/user.ts

interface UserContext {
  currentPhase: string; // e.g., 'Transformation'
  currentArchetype: string; // e.g., 'Healer'
}

class UserAgent {
  context: UserContext;

  constructor(context: UserContext) {
    this.context = context;
  }

  getCurrentContext(): UserContext {
    return this.context;
  }
}
