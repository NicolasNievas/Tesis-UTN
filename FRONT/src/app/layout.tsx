import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ToastProvider from "@/context/toast.context";
import Navbar from "@/components/templates/Navbar";
import Footer from "@/components/templates/Footer";
import { AuthProvider } from "@/context/data.context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Coffe Craze",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
        <ToastProvider>
          <Navbar />
          {children}
          <Footer />
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
