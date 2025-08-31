import { getCurrentUser, requireAuth } from "@/lib/auth";

// server hook for getting current user
export const useServerAuth = async () => {
  try {
    const user = await getCurrentUser();

    return {
      user,
      isAuthenticated: !!user,
      isLoading: false,
    };
  } catch (error) {
    console.error("Error in useServerAuth:", error);
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

// server hook for redirecting unauthenticated users
export const useProtectedServerAuth = async () => {
  try {
    const user = await requireAuth();

    return {
      user,
      isAuthenticated: true,
      isLoading: false,
    };
  } catch (error) {
    // requireAuth will handle the redirect automatically
    throw error;
  }
};
