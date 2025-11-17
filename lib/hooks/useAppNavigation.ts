"use client";

import { useRouter } from "next/navigation";

export const PATHS = {
  LANDING: "/",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  DASHBOARD: "/dashboard",
};

type AppRouteName = "landing" | "signin" | "signup" | "dashboard";

export const useAppNavigation = () => {
  const router = useRouter();

  const routeHandlers: Record<AppRouteName, () => void> = {
    landing: () => {
      router.push(PATHS.LANDING);
    },
    signin: () => {
      router.push(PATHS.SIGN_IN);
    },
    signup: () => {
      router.push(PATHS.SIGN_UP);
    },
    dashboard: () => {
      router.push(PATHS.DASHBOARD);
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
