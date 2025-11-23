// components/molecules/deck/CreateDeckModal.tsx
"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleInput from "@/components/atoms/SimpleInput";
import SimpleTextArea from "@/components/atoms/SimpleTextArea";
import { Button } from "@/components/atoms/button";
import {
  createDeckSchema,
  type CreateDeckForm,
} from "@/lib/schemas/deck.schemas";
import { useCreateDeck } from "@/lib/service/hooks/useDecks";

// esses nomes dependem de como você exportou em atoms/dialog
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";

type CreateDeckModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { control, handleSubmit, reset, formState } = useForm<CreateDeckForm>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: { title: "", description: "" },
    mode: "onTouched",
  });

  const { errors, isSubmitting } = formState;
  const createDeckMutation = useCreateDeck();

  const onSubmit = async (data: CreateDeckForm) => {
    try {
      await createDeckMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message ?? "Erro ao criar deck");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar novo deck</DialogTitle>
            <DialogDescription>
              Preencha as informações do seu deck.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <>
                  <SimpleInput
                    label="Título"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Nome do deck"
                    autoComplete="off"
                  />
                  {errors.title?.message && (
                    <p className="text-xs text-rose-400 -mt-2">
                      {errors.title.message}
                    </p>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <>
                  <SimpleTextArea
                    label="Descrição (opcional)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Uma breve descrição do deck"
                  />
                  {errors.description?.message && (
                    <p className="text-xs text-rose-400 -mt-2">
                      {errors.description.message}
                    </p>
                  )}
                </>
              )}
            />

            <div className="flex items-center gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar deck"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CreateDeckModal;
