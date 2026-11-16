import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/ui/theme/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Deckfolio",
    template: "%s / Deckfolio",
  },
  description: "Presentations that live on the web.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}