// app/decks/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { useGetDeck } from "@/lib/service/hooks/useDecks";
import { Button } from "@/components/atoms/button";
import CreateCardModal from "@/components/molecules/card/CreateCardModal";
import EditCardModal from "@/components/molecules/card/EditCardModal";
import CardItem from "@/components/molecules/card/CardItem";
import { useGetCards, useDeleteCard } from "@/lib/hooks/useCards";
import { Card as CardType } from "@/lib/service/card";
import { useGetDueCount, useGetNext } from "@/lib/hooks/useStudy";

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data: deck, isLoading, isError } = useGetDeck(id);
  const [openCreate, setOpenCreate] = useState(false);

  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const { data: cards = [], isLoading: cardsLoading } = useGetCards(id);
  const deleteMutation = useDeleteCard();

  // study status hooks
  const dueCountQuery = useGetDueCount(id);
  const nextItemsQuery = useGetNext(id, 1);

  const dueCount = dueCountQuery.data ?? 0;
  const nextDueIso = nextItemsQuery.data?.[0]?.dueDate;
  const nextDueLabel = nextDueIso ? new Date(nextDueIso).toLocaleString() : "—";

  const handleDelete = async (cardId: string) => {
    try {
      await deleteMutation.mutateAsync(cardId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message ?? "Erro ao deletar card");
    }
  };

  const handleEdit = (card: CardType) => {
    setEditingCard(card);
    setOpenEdit(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {deck?.title ?? (isLoading ? "Carregando..." : "Deck")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {deck ? "Visão do deck" : ""}
            </p>
            {deck && (
              <p className="text-xs text-muted-foreground mt-1">
                Cartões:{" "}
                <span className="font-medium">{deck.cardsCount ?? 0}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.replace("/dashboard")}
            >
              Voltar
            </Button>
            <Button onClick={() => setOpenCreate(true)}>+ Novo card</Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Detalhes do Deck</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/decks/${id}/study`)}
                >
                  Começar estudo
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : isError ? (
              <div className="py-6 text-center text-sm text-rose-400">
                Erro ao carregar deck
              </div>
            ) : !deck ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Deck não encontrado
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium">{deck.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {deck.description ?? "Sem descrição"}
                  </p>
                </div>

                {/* STUDY STATUS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="p-3 border rounded bg-white dark:bg-gray-800">
                    <div className="text-xs text-muted-foreground">Cartões</div>
                    <div className="text-lg font-medium">
                      {deck.cardsCount ?? 0}
                    </div>
                  </div>

                  <div className="p-3 border rounded bg-white dark:bg-gray-800">
                    <div className="text-xs text-red-500">Devidos</div>
                    <div className="text-lg font-medium">{dueCount}</div>
                  </div>

                  <div className="p-3 border rounded bg-white dark:bg-gray-800">
                    <div className="text-xs text-muted-foreground">
                      Próxima revisão
                    </div>
                    <div className="text-sm font-medium">{nextDueLabel}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(deck.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards list */}
        <section className="mt-6 space-y-3">
          <h3 className="text-md font-medium">Cards</h3>

          {cardsLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Carregando cards...
            </div>
          ) : cards.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum card ainda. Crie o primeiro!
            </div>
          ) : (
            <div className="grid gap-3">
              {cards.map((c) => (
                <CardItem
                  key={c.id}
                  card={c}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {id && (
        <CreateCardModal
          open={openCreate}
          onOpenChange={setOpenCreate}
          deckId={id}
        />
      )}

      <EditCardModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        card={editingCard}
      />
    </main>
  );
}
