"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { DetectedObject } from "@/lib/service/detection";

type DetectionResultModalProps = {
  objects: DetectedObject[];
  onSelect: (object: DetectedObject) => void;
  onClose: () => void;
};

export const DetectionResultModal: React.FC<DetectionResultModalProps> = ({
  objects,
  onSelect,
  onClose,
}) => {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Objetos detectados"
    >
      {/* Tap fora fecha */}
      <div className="flex-1" onClick={onClose} />

      <div className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-safe-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <h3 className="text-white font-semibold text-lg mb-1">
          O que você quer estudar?
        </h3>
        <p className="text-white/50 text-sm mb-5">
          Detectei esses objetos na imagem. Toque em um para aprender em inglês.
        </p>

        <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
          {objects.map((obj) => (
            <li key={obj.labelEn}>
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors text-left"
                onClick={() => onSelect(obj)}
              >
                <div>
                  <span className="text-white font-medium capitalize">
                    {obj.labelPt}
                  </span>
                  <span className="block text-white/40 text-xs mt-0.5">
                    {Math.round(obj.score * 100)}% de confiança
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full mt-4 mb-2 py-3 rounded-xl text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          Tirar outra foto
        </button>
      </div>
    </div>
  );
};
