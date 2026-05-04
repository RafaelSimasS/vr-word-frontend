export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <span className="inline-block rotate-180" aria-label="Copyleft">
          ©
        </span>{" "}
        2026 Rafael de Sousa Simas.
      </footer>
    </>
  );
}
