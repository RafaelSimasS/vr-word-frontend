"use client";

import React from "react";
import { Camera, Crosshair, Sparkles, X } from "lucide-react";
import { Button } from "@/components/atoms/button";

type CameraTutorialProps = {
  onDismiss: () => void;
};

const steps = [
  {
    icon: <Camera className="w-7 h-7 text-white" />,
    title: "Aponte a câmera",
    description:
      "Aponte a câmera para qualquer objeto ao seu redor que você queira aprender em inglês.",
  },
  {
    icon: <Crosshair className="w-7 h-7 text-white" />,
    title: "Centralize o objeto",
    description:
      "Mantenha o objeto dentro da área de foco e aguarde a estabilização.",
  },
  {
    icon: <Sparkles className="w-7 h-7 text-white" />,
    title: "Capture e aprenda",
    description:
      "Aperte o botão de captura. A IA vai identificar o objeto e você escolhe a palavra para estudar.",
  },
];

export const CameraTutorial: React.FC<CameraTutorialProps> = ({
  onDismiss,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex justify-end p-4">
        <button
          onClick={onDismiss}
          aria-label="Fechar tutorial"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Como usar</h2>
          <p className="text-white/60 text-sm">
            Deslize para baixo ou toque em X para começar
          </p>
        </div>

        <div className="w-full space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <p className="text-white font-semibold">{step.title}</p>
                <p className="text-white/60 text-sm mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <Button
          className="w-full bg-white text-black hover:bg-white/90 font-semibold"
          onClick={onDismiss}
        >
          Entendido, vamos lá!
        </Button>
      </div>
    </div>
  );
};
