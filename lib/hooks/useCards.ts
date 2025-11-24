// lib/hooks/useCards.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCard,
  updateCard,
  deleteCard,
  getCard,
  listCards,
  type Card,
  type CreateCardDTO,
  type UpdateCardDTO,
} from "@/lib/service/card";
import { parseAxiosError } from "@/lib/service/parse";

/**
 * Query keys helpers
 */
export const CARDS_LIST_KEY = (deckId?: string) => ["cards", deckId];
export const cardKey = (id?: string) => ["card", id];

/**
 * useGetCards - lista os cards de um deck
 */
export function useGetCards(deckId?: string) {
  return useQuery<Card[]>({
    queryKey: CARDS_LIST_KEY(deckId),
    queryFn: async () => {
      if (!deckId) return [];
      return listCards({ deckId });
    },
    enabled: !!deckId,
    staleTime: 1000 * 60 * 0.5, // 30s
    placeholderData: keepPreviousData,
  });
}

/**
 * useGetCard - pega um card por id
 */
export function useGetCard(id?: string) {
  return useQuery<Card | null>({
    queryKey: cardKey(id),
    queryFn: async () => {
      if (!id) return null;
      return getCard(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 1, // 1min
  });
}

/**
 * useCreateCard
 */
export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateCardDTO) => {
      return createCard(dto);
    },
    onMutate: async (newCard) => {
      // optimistic update: add a temp card to the list for the deck
      const listKey = CARDS_LIST_KEY(newCard.deckId);
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<Card[]>(listKey);
      if (previous) {
        const fake: Card = {
          id: "temp-" + Date.now(),
          front: newCard.front,
          back: newCard.back,
          deckId: newCard.deckId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData<Card[]>(listKey, [fake, ...previous]);
      }
      return { previous };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error, variables, context: any) => {
      // rollback
      const listKey = CARDS_LIST_KEY(variables.deckId);
      if (context?.previous) {
        qc.setQueryData(listKey, context.previous);
      }

      try {
        const { errorId } = parseAxiosError(error);
        switch (errorId) {
          case "DeckNotFound":
            throw new Error("Deck não encontrado.");
          case "CardValidation":
            throw new Error("Dados do card inválidos.");
          default:
            throw new Error("Erro ao criar card.");
        }
      } catch (e) {
        throw e instanceof Error ? e : new Error("Erro ao criar card.");
      }
    },
    onSuccess: (created) => {
      // invalidate the list for the deck
      qc.invalidateQueries({ queryKey: CARDS_LIST_KEY(created.deckId) });
    },
  });
}

/**
 * useUpdateCard
 */
export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCardDTO;
    }) => {
      return updateCard(id, payload);
    },
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: cardKey(id) });
      const previous = qc.getQueryData<Card>(cardKey(id));
      if (previous) {
        const updated: Card = {
          ...previous,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(cardKey(id), updated);

        // also update deck list if cached
        const listKey = CARDS_LIST_KEY(previous.deckId);
        qc.setQueryData<Card[] | undefined>(listKey, (old) =>
          old
            ? old.map((c) =>
                c.id === id
                  ? { ...c, ...payload, updatedAt: updated.updatedAt }
                  : c
              )
            : old
        );
      }
      return { previous };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error, variables, context: any) => {
      if (context?.previous) {
        qc.setQueryData(cardKey(variables.id), context.previous);
      }

      try {
        const { errorId } = parseAxiosError(error);
        switch (errorId) {
          case "CardNotFound":
            throw new Error("Card não encontrado.");
          case "CardValidation":
            throw new Error("Dados do card inválidos.");
          default:
            throw new Error("Erro ao atualizar o card.");
        }
      } catch (e) {
        throw e instanceof Error ? e : new Error("Erro ao atualizar o card.");
      }
    },
    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({ queryKey: cardKey(variables.id) });
      // also invalidate the deck list if we can read deckId from cache (best effort)
      const maybe = qc.getQueryData<Card>(cardKey(variables.id));
      const deckId = maybe?.deckId;
      if (deckId) qc.invalidateQueries({ queryKey: CARDS_LIST_KEY(deckId) });
    },
  });
}

/**
 * useDeleteCard
 */
export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteCard(id);
    },
    onMutate: async (id: string) => {
      // remove from list optimistic
      await qc.cancelQueries({ queryKey: CARDS_LIST_KEY(undefined) }); // best-effort cancel all cards lists
      // try to find the deckId from cache to only mutate that list
      const existingCard = qc.getQueryData<Card>(cardKey(id));
      const deckId = existingCard?.deckId;
      const listKey = CARDS_LIST_KEY(deckId);
      const previous = deckId ? qc.getQueryData<Card[]>(listKey) : undefined;
      if (previous) {
        qc.setQueryData<Card[]>(
          listKey,
          previous.filter((c) => c.id !== id)
        );
      }
      return { previous, deckId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error, id, context: any) => {
      if (context?.previous && context.deckId) {
        qc.setQueryData(CARDS_LIST_KEY(context.deckId), context.previous);
      }

      try {
        const { errorId } = parseAxiosError(error);
        switch (errorId) {
          case "CardNotFound":
            throw new Error("Card não encontrado.");
          default:
            throw new Error("Erro ao deletar o card.");
        }
      } catch (e) {
        throw e instanceof Error ? e : new Error("Erro ao deletar o card.");
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_data, _err, id, context: any) => {
      if (context?.deckId) {
        qc.invalidateQueries({ queryKey: CARDS_LIST_KEY(context.deckId) });
      } else {
        qc.invalidateQueries({ queryKey: ["cards"] });
      }
      qc.invalidateQueries({ queryKey: cardKey(id) });
    },
  });
}
