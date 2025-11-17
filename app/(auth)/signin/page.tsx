"use client";

import React from "react";
import SignInForm from "@/components/organisms/SignInForm";
import Navbar from "@/components/molecules/Navbar";
import { useAppNavigation } from "@/lib/hooks/useAppNavigation";

export default function SignInPage() {
  const navigation = useAppNavigation();

  async function handleSignIn(payload: { email: string; password: string }) {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.message ?? "Erro ao autenticar";
        alert(message);
        return;
      }

      alert("Login efetuado com sucesso!");
      navigation.goToDashboard();
    } catch (err) {
      console.error(err);
      alert("Erro de rede. Tente novamente.");
    }
  }

  return (
    <>
      <Navbar onRouteChange={navigation.handleRouteChange} />
      <SignInForm onSubmit={handleSignIn} />
    </>
  );
}
