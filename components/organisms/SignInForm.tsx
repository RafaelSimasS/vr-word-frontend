"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "@/components/molecules/AuthCard";
import SimpleInput from "@/components/atoms/SimpleInput";
import { Button } from "@/components/atoms/button";
import { SignInFormData, signInSchema } from "@/lib/schemas/auth.schemas";

type SignInPayload = {
  email: string;
  password: string;
};

type SignInFormProps = {
  onSubmit: (payload: SignInPayload) => void;
};

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const submit = (data: SignInFormData) => {
    setLoading(true);
    try {
      onSubmit({ email: data.email, password: data.password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Entrar"
      subtitle="Informe seus dados para acessar sua conta!"
    >
      <form onSubmit={handleSubmit(submit)} className="w-full" noValidate>
        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <>
              <SimpleInput
                label="Email"
                value={field.value}
                onChange={field.onChange}
                type="email"
                placeholder="voce@exemplo.com"
              />
              {errors.email?.message && (
                <p className="text-xs text-rose-400 -mt-2 mb-3">
                  {errors.email.message}
                </p>
              )}
            </>
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <>
              <SimpleInput
                label="Senha"
                value={field.value}
                onChange={field.onChange}
                type="password"
                placeholder="••••••••"
              />
              {errors.password?.message && (
                <p className="text-xs text-rose-400 -mt-2 mb-3">
                  {errors.password.message}
                </p>
              )}
            </>
          )}
        />

        <div className="mt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignInForm;
