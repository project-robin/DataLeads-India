import type { Metadata } from "next";
import { Castoro, Inter, Manrope, Geist } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const castoro = Castoro({
  variable: "--font-castoro",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vetics.space — 24/7 Conversational AI Receptionists & Call Assistants",
  description: "Vetics.space deploys natural AI voice receptionists for service-based businesses. Capture missed calls, automate appointment scheduling, and call back web leads in under 10 seconds with 98%+ conversation accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={cn("antialiased", castoro.variable, inter.variable, manrope.variable, "font-sans", geist.variable)}
    >
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
