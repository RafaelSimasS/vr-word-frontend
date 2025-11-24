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

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data: deck, isLoading, isError } = useGetDeck(id);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
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
            <Button variant="ghost" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button onClick={() => setOpenCreate(true)}>+ Novo card</Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Deck</CardTitle>
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

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(deck.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {id && (
        <CreateCardModal
          open={openCreate}
          onOpenChange={setOpenCreate}
          deckId={id}
        />
      )}
    </main>
  );
}
