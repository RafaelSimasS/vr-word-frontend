// lib/hooks/useDecks.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createDeck,
  updateDeck,
  deleteDeck,
  getDeck,
  listDecks,
  type Deck,
  type CreateDeckDTO,
  type UpdateDeckDTO,
} from "@/lib/service/deck";
import { parseAxiosError } from "../parse";

export const DECKS_QUERY_KEY = ["decks"];
export const deckKey = (id: string | undefined) => ["deck", id];

export function useGetDecks() {
  return useQuery<Deck[]>({
    queryKey: DECKS_QUERY_KEY,
    queryFn: async () => {
      return listDecks();
    },
    staleTime: 1000 * 60 * 0.5, // 30s
    placeholderData: keepPreviousData,
  });
}

export function useGetDeck(id?: string) {
  return useQuery<Deck | null>({
    queryKey: deckKey(id),
    queryFn: async () => {
      if (!id) return null;
      return getDeck(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 1, // 1min
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateDeckDTO) => {
      return createDeck(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_QUERY_KEY });
    },
    onError: (error) => {
      const { errorId } = parseAxiosError(error);
      switch (errorId) {
        case "DeckTitleTaken":
          throw new Error("Já existe um deck com esse título.");
        default:
          throw new Error("Erro ao criar o deck.");
      }
    },
  });
}

export function useUpdateDeck() {
  const qc = useQueryClient();

  return useMutation<
    Deck,
    unknown,
    { id: string; payload: UpdateDeckDTO },
    { previous?: Deck }
  >({
    mutationFn: async ({ id, payload }) => {
      return updateDeck(id, payload);
    },
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: deckKey(id) });
      const previous = qc.getQueryData<Deck>(deckKey(id));
      if (previous) {
        const updated: Deck = {
          ...previous,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(deckKey(id), updated);

        qc.setQueryData<Deck[] | undefined>(DECKS_QUERY_KEY, (old) =>
          old
            ? old.map((d) =>
                d.id === id
                  ? { ...d, ...payload, updatedAt: updated.updatedAt }
                  : d
              )
            : old
        );
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        qc.setQueryData(deckKey(variables.id), context.previous);
      }
      try {
        const { errorId } = parseAxiosError(_err);
        switch (errorId) {
          case "DeckNotFound":
            throw new Error("Deck não encontrado.");
          case "DeckTitleTaken":
            throw new Error("Já existe um deck com esse título.");
          default:
            throw new Error("Erro ao atualizar o deck.");
        }
      } catch (e) {
        throw e instanceof Error ? e : new Error("Erro ao atualizar o deck.");
      }
    },
    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({ queryKey: deckKey(variables.id) });
      qc.invalidateQueries({ queryKey: DECKS_QUERY_KEY });
    },
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();

  return useMutation<void, unknown, string, { previous?: Deck[] }>({
    mutationFn: async (id: string) => {
      return deleteDeck(id);
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: DECKS_QUERY_KEY });
      const previous = qc.getQueryData<Deck[]>(DECKS_QUERY_KEY);
      if (previous) {
        qc.setQueryData<Deck[]>(
          DECKS_QUERY_KEY,
          previous.filter((d) => d.id !== id)
        );
      }
      return { previous };
    },
    onError: (error, id, context) => {
      if (context?.previous) {
        qc.setQueryData(DECKS_QUERY_KEY, context.previous);
      }

      try {
        const { errorId } = parseAxiosError(error);
        switch (errorId) {
          case "DeckNotFound":
            throw new Error("Deck não encontrado.");
          default:
            throw new Error("Erro ao deletar o deck.");
        }
      } catch (e) {
        throw e instanceof Error ? e : new Error("Erro ao deletar o deck.");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: DECKS_QUERY_KEY });
    },
  });
}
