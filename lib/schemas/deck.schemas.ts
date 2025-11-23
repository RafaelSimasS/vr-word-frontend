import { z } from "zod";

export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Título é obrigatório" })
    .max(200, { message: "Máx 200 caracteres" }),
  description: z
    .string()
    .max(2000, { message: "Máx 2000 caracteres" })
    .optional(),
});

export type CreateDeckForm = z.infer<typeof createDeckSchema>;
