// app/decks/[id]/study/page.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { useGetNext, useReviewCard } from "@/lib/hooks/useStudy";
import { renderMarkupToHtml } from "@/components/atoms/RichTextarea";

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.id as string | undefined;

  // fetch due cards for this deck (limit e.g. 50)
  const { data: items = [], isLoading } = useGetNext(deckId, 50);

  // local state
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const reviewMutation = useReviewCard();

  const current = items[index];

  const onReveal = () => setRevealed(true);

  const handleQuality = async (quality: number) => {
    if (!current) return;
    try {
      await reviewMutation.mutateAsync({ cardId: current.cardId, quality });
      // move to next card
      setRevealed(false);
      setIndex((i) => {
        const next = i + 1;
        if (next >= items.length) return i; // keep at end — we could fetch again or show finished
        return next;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message ?? "Erro ao enviar revisão");
    }
  };

  const resetStudy = () => {
    setIndex(0);
    setRevealed(false);
  };

  const remaining = items.length - index;

  const card = current?.card;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Estudo</h1>
            <p className="text-sm text-muted-foreground">Deck: {deckId}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.replace(`/decks/${deckId}`)}
            >
              Voltar
            </Button>
            <Button variant="secondary" onClick={resetStudy}>
              Reiniciar
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading
                ? "Carregando cards..."
                : card
                ? `Card ${index + 1} de ${items.length}`
                : "Nenhum card devido"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : !card ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum card devido agora. Verifique mais tarde.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Front */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Frente</div>
                  <div
                    className="p-4 bg-white dark:bg-gray-800 border rounded min-h-[120px] wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkupToHtml(card.front),
                    }}
                  />
                </div>

                {/* Reveal / Back */}
                <div>
                  {!revealed ? (
                    <div className="flex justify-center">
                      <Button onClick={onReveal}>Mostrar resposta</Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500 mb-1">Costa</div>
                      <div
                        className="p-4 bg-white dark:bg-gray-800 border rounded min-h-[120px] wrap-break-word"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkupToHtml(card.back),
                        }}
                      />

                      <div className="mt-4">
                        <div className="text-sm mb-2">
                          Como foi? (0 = não lembrei; 5 = perfeito)
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4, 5].map((q) => (
                            <Button key={q} onClick={() => handleQuality(q)}>
                              {q}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Cards restantes: {remaining}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
