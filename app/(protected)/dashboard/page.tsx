// app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { useAuth } from "@/lib/auth/AuthProvider";
import Navbar from "@/components/molecules/Navbar";
import { useRouter } from "next/navigation";
import { Deck as DeckComponent } from "@/components/molecules/deck/deck";
import CreateDeckModal from "@/components/molecules/deck/CreateDeckModal";
import { useGetDecks } from "@/lib/service/hooks/useDecks";
import { Button } from "@/components/atoms/button";

export default function DashboardPage() {
  const { user: userAuthInfo } = useAuth();
  const router = useRouter();

  const email = userAuthInfo?.email ?? "";
  const username =
    email && email.includes("@") ? email.split("@")[0] : email || "Usuário";

  const [openCreate, setOpenCreate] = useState(false);

  const { data: decks = [], isLoading, isError } = useGetDecks();

  const goToSignIn = () => router.push("/signin");
  const goToSignUp = () => router.push("/signup");

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
              <div className="flex items-center justify-between w-full">
                <CardTitle>Decks de Cartões</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setOpenCreate(true)}>
                    + Novo deck
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um deck para abrir ou começar a estudar.
              </p>

              <div className="grid gap-3 max-h-72 overflow-y-auto">
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Carregando decks...
                  </div>
                ) : isError ? (
                  <div className="py-6 text-center text-sm text-rose-400">
                    Erro ao carregar decks
                  </div>
                ) : decks.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum deck encontrado. Crie o primeiro!
                  </div>
                ) : (
                  decks.map((deck) => (
                    <div
                      key={deck.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/decks/${deck.id}`)}
                    >
                      <DeckComponent {...deck} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          &copy; 2025 Rafael de Sousa Simas. Todos os direitos reservados.
        </footer>
      </div>

      <CreateDeckModal open={openCreate} onOpenChange={setOpenCreate} />
    </main>
  );
}
