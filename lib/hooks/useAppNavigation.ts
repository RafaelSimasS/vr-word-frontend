"use client";

import { useRouter } from "next/navigation";

export const PATHS = {
  LANDING: { path: "/", isSecure: false },
  SIGN_IN: { path: "/signin", isSecure: false },
  SIGN_UP: { path: "/signup", isSecure: false },
  DASHBOARD: { path: "/dashboard", isSecure: true },
};

export type AppRouteName = "landing" | "signin" | "signup" | "dashboard";

export const useAppNavigation = () => {
  const router = useRouter();

  const routeHandlers: Record<AppRouteName, () => void> = {
    landing: () => {
      router.push(PATHS.LANDING.path);
    },
    signin: () => {
      router.push(PATHS.SIGN_IN.path);
    },
    signup: () => {
      router.push(PATHS.SIGN_UP.path);
    },
    dashboard: () => {
      router.push(PATHS.DASHBOARD.path);
    },
  };

  const handleRouteChange = (routeName: AppRouteName) => {
    const handler = routeHandlers[routeName];
    if (handler) {
      handler();
    } else {
      console.error(`Unknown route name: ${routeName}`);
    }
  };

  return {
    handleRouteChange,
    goToLanding: routeHandlers.landing,
    goToSignIn: routeHandlers.signin,
    goToSignUp: routeHandlers.signup,
    goToDashboard: routeHandlers.dashboard,
  };
};
