"use client";
import Navbar from "@/components/molecules/Navbar";
import SignUpForm from "@/components/organisms/SignUpForm";
import { useAppNavigation } from "@/lib/hooks/useAppNavigation";

export default function SignUpPage() {
  const navigation = useAppNavigation();

  async function handleSignUp(payload: { email: string; password: string }) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.message ?? "Erro ao criar conta";
        alert(message);
        return;
      }

      alert("Conta criada com sucesso!");
      navigation.goToDashboard();
    } catch (err) {
      console.error(err);
      alert("Erro de rede. Tente novamente.");
    }
  }

  return (
    <>
      <Navbar onRouteChange={navigation.handleRouteChange} />
      <SignUpForm onSubmit={handleSignUp} />
    </>
  );
}
