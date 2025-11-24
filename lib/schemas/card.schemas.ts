import { z } from "zod";

export const createCardSchema = z.object({
  front: z.string().min(1, { message: "Frente é obrigatória" }).max(5000),
  back: z.string().min(1, { message: "Costa é obrigatória" }).max(5000),
});

export type CreateCardForm = z.infer<typeof createCardSchema>;
