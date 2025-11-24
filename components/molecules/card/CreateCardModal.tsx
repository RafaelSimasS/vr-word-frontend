"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCardSchema,
  type CreateCardForm,
} from "@/lib/schemas/card.schemas";
import { useCreateCard } from "@/lib/hooks/useCards";
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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deckId: string;
};

const CreateCardModal: React.FC<Props> = ({ open, onOpenChange, deckId }) => {
  const { control, handleSubmit, reset, formState } = useForm<CreateCardForm>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { front: "", back: "" },
    mode: "onTouched",
  });

  const [tab, setTab] = useState<"front" | "back">("front");
  const createMutation = useCreateCard();

  const onSubmit = async (data: CreateCardForm) => {
    try {
      await createMutation.mutateAsync({ ...data, deckId });
      reset();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message ?? "Erro ao criar card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        {/* Ajustes importantes abaixo: max-w responsivo, não ultrapassa tela, e scroll interno */}
        <DialogContent className="w-full max-w-[calc(100%-32px)] sm:max-w-2xl max-h-[90vh] overflow-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <DialogTitle>Novo card</DialogTitle>
                <DialogDescription>
                  Adicione frente e costa com formatação.
                </DialogDescription>
              </div>
              <DialogClose></DialogClose>
            </div>
          </DialogHeader>

          <div className="mt-4 min-w-0">
            {/* tabs */}
            <div className="flex gap-2 border-b mb-3 min-w-0 overflow-x-auto">
              <button
                className={`px-3 py-2 -mb-px ${
                  tab === "front"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTab("front")}
                type="button"
              >
                Frente
              </button>
              <button
                className={`px-3 py-2 -mb-px ${
                  tab === "back"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setTab("back")}
                type="button"
              >
                Costa
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 min-w-0"
            >
              <Controller
                name="front"
                control={control}
                render={({ field }) => (
                  <div className={`${tab !== "front" ? "hidden" : ""} min-w-0`}>
                    {/* Wrapper com w-full + min-w-0 para permitir encolher corretamente em flex containers */}
                    <div className="w-full min-w-0">
                      <RichTextarea
                        label="Frente"
                        value={field.value}
                        onChange={field.onChange}
                        rows={6}
                        placeholder="Texto da frente..."
                      />
                    </div>

                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Preview:</div>
                      <div
                        className="p-3 border rounded min-h-[80px] bg-white dark:bg-gray-800 break-words max-h-[30vh] sm:max-h-[200px] overflow-auto"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkupToHtml(field.value),
                        }}
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                name="back"
                control={control}
                render={({ field }) => (
                  <div className={`${tab !== "back" ? "hidden" : ""} min-w-0`}>
                    <div className="w-full min-w-0">
                      <RichTextarea
                        label="Costa"
                        value={field.value}
                        onChange={field.onChange}
                        rows={6}
                        placeholder="Texto da costa..."
                      />
                    </div>

                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Preview:</div>
                      <div
                        className="p-3 border rounded min-h-[80px] bg-white dark:bg-gray-800 break-words max-h-[30vh] sm:max-h-[200px] overflow-auto"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkupToHtml(field.value),
                        }}
                      />
                    </div>
                  </div>
                )}
              />

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

export default CreateCardModal;
