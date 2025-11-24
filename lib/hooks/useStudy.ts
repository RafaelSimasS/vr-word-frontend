// lib/hooks/useStudy.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNext,
  getProgress,
  reviewCard,
  type StudyNextItem,
  type StudyProgress,
} from "@/lib/service/study";

/**
 * Query keys helpers
 */
export const STUDY_NEXT_KEY = (deckId?: string) => ["study", "next", deckId];
export const STUDY_PROGRESS_KEY = (cardId?: string) => [
  "study",
  "progress",
  cardId,
];

/**
 * useGetNext - retorna lista de itens devidos (com card)
 * enabled quando deckId definido (if you want all decks, pass no deckId)
 */
export function useGetNext(deckId?: string, limit = 20) {
  return useQuery<StudyNextItem[]>({
    queryKey: STUDY_NEXT_KEY(deckId),
    queryFn: async () => {
      return getNext({ deckId, limit });
    },
    enabled: !!deckId,
    staleTime: 1000 * 30, // 30s
    placeholderData: keepPreviousData,
  });
}

/**
 * useGetDueCount - convenient hook to get how many are due for this deck (calls getNext with a large limit and returns length)
 * note: backend currently returns up to limit rows; we use a reasonably large limit.
 */
export function useGetDueCount(deckId?: string) {
  return useQuery<number>({
    queryKey: ["study", "dueCount", deckId],
    queryFn: async () => {
      if (!deckId) return 0;
      const items = await getNext({ deckId, limit: 10000 });
      return items.length;
    },
    enabled: !!deckId,
    staleTime: 1000 * 20, // 20s
  });
}

/**
 * useGetProgress - get study progress for a card (nullable)
 */
export function useGetProgress(cardId?: string) {
  return useQuery<StudyProgress | null>({
    queryKey: STUDY_PROGRESS_KEY(cardId),
    queryFn: async () => {
      if (!cardId) return null;
      return getProgress(cardId);
    },
    enabled: !!cardId,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * useReviewCard - mutation to review a card (quality 0..5)
 * invalidates relevant study and card queries
 */
export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { cardId: string; quality: number }) => {
      return reviewCard(payload);
    },
    onMutate: async (payload) => {
      // optimistic update: update progress cache if exists (best-effort)
      const progKey = STUDY_PROGRESS_KEY(payload.cardId);
      await qc.cancelQueries({ queryKey: progKey });
      const previous = qc.getQueryData(progKey);
      // no optimistic concrete compute, just mark lastReviewed optimistically
      if (previous) {
        qc.setQueryData(progKey, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(previous as any),
          lastReviewed: new Date().toISOString(),
        });
      }
      return { previous };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        qc.setQueryData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          STUDY_PROGRESS_KEY((_vars as any).cardId),
          context.previous
        );
      }
    },
    onSuccess: (updated) => {
      // invalidate the progress cache and the next-list for the deck of the card
      qc.invalidateQueries({ queryKey: STUDY_PROGRESS_KEY(updated.cardId) });

      // best-effort: find deckId if cached inside any STUDY_NEXT_KEY entries
      // Invalidate all study next lists (safer)
      qc.invalidateQueries({ queryKey: ["study", "next"] });
      // also invalidate cards list and deck data so UI updates (if you cache deck/cards)
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      // invalidate dueCount for any deck
      qc.invalidateQueries({ queryKey: ["study", "dueCount"] });
    },
  });
}
