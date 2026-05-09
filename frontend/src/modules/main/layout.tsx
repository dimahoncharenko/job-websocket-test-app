import { ReactNode } from "react";
import type { Metadata } from "next";
import { Geologica } from "next/font/google";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wellness Platform",
  description: "Personalized wellness planning",
};

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geologica.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
