import React from "react";
import { Button } from "@/components/atoms/button";

type LandingHeroProps = {
  onRouteChange: (route: "landing" | "signin" | "signup") => void;
};

const LandingHero: React.FC<LandingHeroProps> = ({ onRouteChange }) => {
  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-linear-to-b from-black to-neutral-900 text-white px-6 py-20">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          VRWords
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-300">
          Aprender vocabulário de forma imersiva.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            onClick={() => onRouteChange("signup")}
            className="w-full sm:w-auto"
          >
            Comece
          </Button>
          <Button
            onClick={() => onRouteChange("signin")}
            className="w-full sm:w-auto"
          >
            Entrar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
