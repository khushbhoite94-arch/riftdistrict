import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { AIChatbot } from "@/components/ui/AIChatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <ClientProviders>
          <Navbar />

          <main className="pt-20 sm:pt-24">
            {children}
          </main>

          {/* AI Chatbot */}
          <AIChatbot />
        </ClientProviders>
      </body>
    </html>
  );
}