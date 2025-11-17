"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "@/components/molecules/AuthCard";
import SimpleInput from "@/components/atoms/SimpleInput";
import { Button } from "@/components/atoms/button";
import { SignUpFormData, signUpSchema } from "@/lib/schemas/auth.schemas";

type SignUpPayload = {
  email: string;
  password: string;
};

type SignUpFormProps = {
  onSubmit: (payload: SignUpPayload) => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const submit = (data: SignUpFormData) => {
    setLoading(true);
    try {
      onSubmit({ email: data.email, password: data.password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Informe seus dados para criar sua conta!"
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
                placeholder="Pelo menos 8 caracteres"
              />
              {errors.password?.message && (
                <p className="text-xs text-rose-400 -mt-2 mb-3">
                  {errors.password.message}
                </p>
              )}
            </>
          )}
        />

        {/* Confirm Password */}
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <>
              <SimpleInput
                label="Confirmação da senha"
                value={field.value}
                onChange={field.onChange}
                type="password"
                placeholder="Repita sua senha"
              />
              {errors.confirmPassword?.message && (
                <p className="text-xs text-rose-400 -mt-2 mb-3">
                  {errors.confirmPassword.message}
                </p>
              )}
            </>
          )}
        />

        <div className="mt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignUpForm;
