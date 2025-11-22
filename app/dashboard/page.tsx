"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { useAuth } from "@/lib/auth/AuthProvider";
import Navbar from "@/components/molecules/Navbar";
import { useRouter } from "next/navigation";
import { Deck, DeckType } from "@/components/molecules/deck/deck";

export default function DashboardPage() {
  const { user: userAuthInfo } = useAuth();
  const router = useRouter();

  const email = userAuthInfo?.email ?? "";
  const username =
    email && email.includes("@") ? email.split("@")[0] : email || "Usuário";

  const decks: DeckType[] = [
    {
      id: "d1",
      title: "Deck Básico",
      description: "Cartões para revisão rápida",
    },
    { id: "d2", title: "Kanji - N5", description: "40 cartões com kanjis N5" },
    { id: "d3", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d4", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d5", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d6", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d7", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d8", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d9", title: "React Hooks", description: "Snippets e perguntas" },
    { id: "d10", title: "React Hooks", description: "Snippets e perguntas" },
  ];

  const goToSignIn = () => {
    router.push("/signin");
  };

  const goToSignUp = () => {
    router.push("/signup");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 md:p-8">
      <Navbar
        onRouteChange={(route) => {
          if (route === "signin") return goToSignIn();
          if (route === "signup") return goToSignUp();
          return router.push("/");
        }}
      />

      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Olá, {username}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo ao seu painel.
          </p>
        </header>

        <section aria-labelledby="decks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decks de Cartões</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um deck para abrir ou começar a estudar.
              </p>

              <div className="grid gap-3 max-h-72 overflow-y-auto">
                {decks.map((deck) => (
                  <Deck key={deck.id} {...deck} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          &copy; 2025 Rafael de Sousa Simas. Todos os direitos reservados.
        </footer>
      </div>
    </main>
  );
}
