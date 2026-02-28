import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  role: 'government' | 'contractor' | 'citizen';
  constituency_id?: number;
  aadhaar?: string;
  civic_score?: number;
}

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  isDemo: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setDemo: (isDemo: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isDemo: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setDemo: (isDemo) => set({ isDemo }),
  logout: () => set({ user: null, profile: null, isDemo: false }),
}));
