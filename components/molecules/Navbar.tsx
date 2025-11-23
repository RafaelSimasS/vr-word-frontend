// components/Navbar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import Logo from "@/components/atoms/Logo";
import { Button } from "@/components/atoms/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/atoms/navigation-menu";
import { PATHS } from "@/lib/hooks/useAppNavigation";

type NavbarProps = {
  onRouteChange: (route: "landing" | "signin" | "signup") => void;
};

const renderNavigationItem = (
  label: string,
  onClick: () => void,
  variant: "default" | "ghost" = "default"
) => (
  <NavigationMenuItem>
    <Button
      variant={variant}
      className={
        variant === "default"
          ? "bg-white text-black hover:bg-white/90"
          : "text-white hover:bg-white/10"
      }
      onClick={onClick}
    >
      {label}
    </Button>
  </NavigationMenuItem>
);

const Navbar: React.FC<NavbarProps> = ({ onRouteChange }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isLoading, isAuthenticated, logout, revalidate } = useAuth();

  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(64);

  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef<number>(0);
  const THRESHOLD = 10;

  useEffect(() => {
    revalidate();
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    if (typeof window !== "undefined") {
      lastScrollY.current = window.scrollY || window.pageYOffset || 0;
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [revalidate]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset || 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastScrollY.current;

          if (currentY <= 0) {
            // topo da página: sempre mostrar
            setVisible(true);
          } else {
            // ignore pequenos deltas
            if (Math.abs(delta) <= THRESHOLD) {
              // nada
            } else if (delta > THRESHOLD) {
              // scroll pra baixo -> esconder
              setVisible(false);
            } else if (delta < -THRESHOLD) {
              // scroll pra cima -> mostrar
              setVisible(true);
            }
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div aria-hidden style={{ height: headerHeight }} className="w-full" />

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-40 backdrop-blur-md bg-black/60 border-b border-white/10 transition-transform duration-300 ease-in-out transform-gpu ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ willChange: "transform" }}
      >
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
                  {!pathname?.startsWith(PATHS.DASHBOARD.path)
                    ? renderNavigationItem("Dashboard", () =>
                        router.push("/dashboard")
                      )
                    : null}
                  {renderNavigationItem("Sair", () => logout(), "ghost")}
                </>
              ) : (
                <>
                  {renderNavigationItem(
                    "Entrar",
                    () => onRouteChange("signin"),
                    "ghost"
                  )}
                  {renderNavigationItem(
                    "Criar conta",
                    () => onRouteChange("signup"),
                    "default"
                  )}
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
};

export default Navbar;
