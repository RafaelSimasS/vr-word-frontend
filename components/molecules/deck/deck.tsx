import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";

export type DeckType = {
  id: string;
  title: string;
  description?: string;
};

export const Deck = (deck: DeckType) => {
  const router = useRouter();
  const openDeck = (id: string) => {
    router.push(`/decks/${id}`);
  };

  const studyDeck = (id: string) => {
    router.push(`/decks/${id}/study`);
  };
  return (
    <div
      key={deck.id}
      className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-gray-800"
    >
      <div>
        <p className="font-medium">{deck.title}</p>
        {deck.description && (
          <p className="text-xs text-muted-foreground">{deck.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => openDeck(deck.id)}>
          Abrir
        </Button>

        <Button size="sm" onClick={() => studyDeck(deck.id)}>
          Estudar
        </Button>
      </div>
    </div>
  );
};
