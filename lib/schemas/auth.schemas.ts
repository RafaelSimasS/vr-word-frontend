import z from "zod";

export const signUpSchema = z
  .object({
    email: z.email("Formato de email inválido").min(1, "Email é obrigatório"),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "A confirmação precisa ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

export const signInSchema = z.object({
  email: z.email("Formato de email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(8, "Senha é obrigatória"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
