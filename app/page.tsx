"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/molecules/Navbar";
import LandingHero from "@/components/organisms/LandingHero";

export default function HomePage() {
  const router = useRouter();

  const goToSignIn = () => {
    // ajusta a rota caso você use outro caminho (ex: /auth/signin)
    router.push("/signin");
  };

  const goToSignUp = () => {
    // ajusta a rota caso você use outro caminho (ex: /auth/signup)
    router.push("/signup");
  };

  return (
    <div className="antialiased min-h-screen bg-black text-white">
      {/* Navbar receberá callbacks que fazem push nas rotas do App Router */}
      <Navbar
        onRouteChange={(route) => {
          if (route === "signin") return goToSignIn();
          if (route === "signup") return goToSignUp();
          return router.push("/");
        }}
      />

      <main className="pt-16">
        {/* LandingHero utiliza os mesmos callbacks para navegação */}
        <LandingHero
          onRouteChange={(route) => {
            if (route === "signin") return goToSignIn();
            if (route === "signup") return goToSignUp();
            return router.push("/");
          }}
        />
      </main>
    </div>
  );
}
