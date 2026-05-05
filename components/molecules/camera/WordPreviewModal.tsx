"use client";

import React, { useState, useCallback } from "react";
import { Volume2, Save, X, ChevronDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useGetDecks } from "@/lib/service/hooks/useDecks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCard } from "@/lib/service/card";
import { DECKS_QUERY_KEY } from "@/lib/service/hooks/useDecks";
import type { GeneratedCard } from "@/lib/service/detection";

type WordPreviewModalProps = {
  wordEn: string;
  wordPt: string;
  card: GeneratedCard;
  onClose: () => void;
  onSaved: () => void;
};

function useTTS() {
  const speak = useCallback((text: string, lang: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  }, []);
  return speak;
}

export const WordPreviewModal: React.FC<WordPreviewModalProps> = ({
  wordEn,
  wordPt,
  card,
  onClose,
  onSaved,
}) => {
  const speak = useTTS();
  const { data: decks = [], isLoading: decksLoading } = useGetDecks();
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDeckId) throw new Error("Selecione um deck");
      // Cria um card para cada par de frases
      await Promise.all(
        card.sentences.map((s) =>
          createCard({
            front: s.en,
            back: s.pt,
            deckId: selectedDeckId,
          }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_QUERY_KEY });
      setSaved(true);
      setTimeout(() => onSaved(), 1200);
    },
  });

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pré-visualização da palavra"
    >
      {/* Tap fora fecha */}
      <div className="flex-1" onClick={onClose} />

      <div className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-safe-bottom max-h-[85vh] flex flex-col">
        {/* Handle + fechar */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-auto"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Palavra principal */}
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-bold text-white capitalize">{wordEn}</h2>
          <button
            onClick={() => speak(wordEn, "en-US")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={`Ouvir pronúncia de ${wordEn}`}
          >
            <Volume2 className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-white/50 text-sm capitalize mb-5">{wordPt}</p>

        {/* Frases geradas */}
        <div className="space-y-3 overflow-y-auto flex-1">
          {card.sentences.map((s, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-white text-sm leading-relaxed flex-1">
                  {s.en}
                </p>
                <button
                  onClick={() => speak(s.en, "en-US")}
                  className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors mt-0.5"
                  aria-label="Ouvir frase em inglês"
                >
                  <Volume2 className="w-4 h-4 text-white/70" />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-1.5 leading-relaxed">
                {s.pt}
              </p>
            </div>
          ))}
        </div>

        {/* Selecionar deck */}
        <div className="mt-5">
          <label
            htmlFor="deck-select"
            className="block text-white/60 text-xs mb-1.5"
          >
            Salvar em qual deck?
          </label>
          <div className="relative">
            <select
              id="deck-select"
              className="w-full appearance-none bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              disabled={decksLoading || saveMutation.isPending || saved}
            >
              <option value="" disabled className="text-gray-800">
                {decksLoading ? "Carregando decks..." : "Selecione um deck"}
              </option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id} className="text-gray-800">
                  {deck.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {saveMutation.isError && (
            <p className="text-rose-400 text-xs mt-2">
              {saveMutation.error?.message ??
                "Erro ao salvar. Tente novamente."}
            </p>
          )}
        </div>

        {/* Botão salvar */}
        <Button
          className="w-full mt-4 mb-2 font-semibold"
          disabled={!selectedDeckId || saveMutation.isPending || saved}
          onClick={() => saveMutation.mutate()}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Salvo!
            </>
          ) : saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Salvar no deck
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
