import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    userRole: string
  ) => void;
  clearTokens: () => void;
  updateAccessToken: (newAccessToken: string) => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userRole: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken, userRole) =>
        set({
          accessToken,
          refreshToken,
          userRole,
          isAuthenticated: true,
        }),

      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userRole: null,
          isAuthenticated: false,
        }),

      updateAccessToken: (newAccessToken) =>
        set((state) => ({
          ...state,
          accessToken: newAccessToken,
        })),
    }),
    {
      name: "token-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userRole: state.userRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
