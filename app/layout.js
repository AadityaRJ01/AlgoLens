import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AlgoLens",
  description: "AI-powered competitive programming companion",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-slate-50 text-slate-900">
          <div className="md:flex md:min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <main>{children}</main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
