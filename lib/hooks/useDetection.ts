"use client";

import { useMutation } from "@tanstack/react-query";
import {
  detectObjects,
  generateCardsForWord,
  type DetectionResult,
  type GeneratedCard,
} from "@/lib/service/detection";

export function useDetectObjects() {
  return useMutation<DetectionResult, Error, string>({
    mutationFn: (imageBase64: string) => detectObjects(imageBase64),
  });
}

export function useGenerateCardsForWord() {
  return useMutation<GeneratedCard, Error, { word: string; deckId?: string }>({
    mutationFn: ({ word, deckId }) => generateCardsForWord(word, deckId),
  });
}
