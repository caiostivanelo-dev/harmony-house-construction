// Placeholder for authentication hook
// Will be implemented when API integration is added

export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
  }
}
