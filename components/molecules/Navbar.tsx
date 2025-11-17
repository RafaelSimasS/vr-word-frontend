// components/Navbar.tsx (apenas o trecho relevante)
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import Logo from "@/components/atoms/Logo";
import { Button } from "@/components/atoms/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/atoms/navigation-menu";

type NavbarProps = {
  onRouteChange: (route: "landing" | "signin" | "signup") => void;
};

const Navbar: React.FC<NavbarProps> = ({ onRouteChange }) => {
  const router = useRouter();
  const { isLoading, isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-md bg-black/60 border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => onRouteChange("landing")}>
          <Logo className="text-white" />
        </Button>

        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            {isLoading ? (
              <NavigationMenuItem>
                <div className="h-8 w-24 rounded bg-white/10 animate-pulse" />
              </NavigationMenuItem>
            ) : isAuthenticated ? (
              <>
                <NavigationMenuItem>
                  <Button
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </Button>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => onRouteChange("signin")}
                  >
                    Sign In
                  </Button>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Button
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => onRouteChange("signup")}
                  >
                    Sign Up
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navbar;
