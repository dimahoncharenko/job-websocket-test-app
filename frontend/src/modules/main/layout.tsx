import { ReactNode } from "react";
import { Geologica } from "next/font/google";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin"],
});

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geologica.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
