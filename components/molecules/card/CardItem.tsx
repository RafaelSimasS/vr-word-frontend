// components/molecules/card/CardItem.tsx
"use client";

import React from "react";
import { Card as CardAtom, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Card as CardType } from "@/lib/service/card";
import { renderMarkupToHtml } from "@/components/atoms/RichTextarea";

type Props = {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
};

const CardItem: React.FC<Props> = ({ card, onEdit, onDelete }) => {
  return (
    <CardAtom className="w-full">
      <CardContent className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="prose-sm max-h-20 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: renderMarkupToHtml(card.front) }}
          />
          <div className="text-xs text-muted-foreground mt-2">
            Atualizado: {new Date(card.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(card)}>
            Editar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (confirm("Excluir este card? Esta ação é irreversível.")) {
                onDelete(card.id);
              }
            }}
          >
            Excluir
          </Button>
        </div>
      </CardContent>
    </CardAtom>
  );
};

export default CardItem;
