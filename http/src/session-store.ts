
export interface ActiveSession {
  classId: string;
  startedAt: Date;
  attendance: Record<string, string>;
}

let activeSession: ActiveSession | null = null;

export const sessionStore = {
  getSession: () => activeSession,
  setSession: (session: ActiveSession | null) => {
    activeSession = session;
  }
};
