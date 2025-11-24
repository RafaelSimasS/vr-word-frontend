"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCardSchema,
  type CreateCardForm,
} from "@/lib/schemas/card.schemas";
import { useUpdateCard } from "@/lib/hooks/useCards";
import { Button } from "@/components/atoms/button";
import RichTextarea, {
  renderMarkupToHtml,
} from "@/components/atoms/RichTextarea";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/atoms/dialog";
import { type Card as CardType } from "@/lib/service/card";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  card?: CardType | null;
};

const EditCardModal: React.FC<Props> = ({ open, onOpenChange, card }) => {
  const { control, handleSubmit, reset, formState } = useForm<CreateCardForm>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { front: card?.front ?? "", back: card?.back ?? "" },
    mode: "onTouched",
  });

  // tabs: "edit" shows both editors, "preview" shows both previews
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const updateMutation = useUpdateCard();

  // keep form synced when `card` changes
  useEffect(() => {
    reset({ front: card?.front ?? "", back: card?.back ?? "" });
  }, [card, reset]);

  const onSubmit = async (data: CreateCardForm) => {
    if (!card) return;
    try {
      await updateMutation.mutateAsync({ id: card.id, payload: data });
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message ?? "Erro ao atualizar card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-full max-w-[calc(100%-32px)] sm:max-w-2xl max-h-[90vh] overflow-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <DialogTitle>Editar card</DialogTitle>
                <DialogDescription>
                  Altere frente e costa com formatação.
                </DialogDescription>
              </div>
              <DialogClose></DialogClose>
            </div>
          </DialogHeader>

          <div className="mt-4 min-w-0">
            {/* tabs: Edit / Preview */}
            <div className="flex gap-2 border-b mb-3 min-w-0">
              <button
                className={`px-3 py-2 -mb-px ${
                  tab === "edit"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTab("edit")}
                type="button"
              >
                Escrever
              </button>
              <button
                className={`px-3 py-2 -mb-px ${
                  tab === "preview"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTab("preview")}
                type="button"
              >
                Preview
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 min-w-0"
            >
              {/* EDIT TAB: both editors */}
              <div
                className={`${
                  tab !== "edit" ? "hidden" : ""
                } min-w-0 space-y-4`}
              >
                <Controller
                  name="front"
                  control={control}
                  render={({ field }) => (
                    <div className="w-full min-w-0">
                      <RichTextarea
                        label="Frente"
                        value={field.value}
                        onChange={field.onChange}
                        rows={6}
                        placeholder="Texto da frente..."
                      />
                    </div>
                  )}
                />

                <Controller
                  name="back"
                  control={control}
                  render={({ field }) => (
                    <div className="w-full min-w-0">
                      <RichTextarea
                        label="Costa"
                        value={field.value}
                        onChange={field.onChange}
                        rows={6}
                        placeholder="Texto da costa..."
                      />
                    </div>
                  )}
                />
              </div>

              {/* PREVIEW TAB: both previews */}
              <div className={`${tab !== "preview" ? "hidden" : ""} min-w-0`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="front"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Frente</div>
                        <div
                          className="p-3 border rounded min-h-[120px] bg-white dark:bg-gray-800 wrap-break-word max-h-[60vh] overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkupToHtml(field.value),
                          }}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="back"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Costa</div>
                        <div
                          className="p-3 border rounded min-h-[120px] bg-white dark:bg-gray-800 wrap-break-word max-h-[60vh] overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkupToHtml(field.value),
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? "Salvando..." : "Salvar card"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default EditCardModal;
