
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { DiamondIcon } from '@/components/icons';
import { User } from 'lucide-react';

function AppHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  }

  if (loading || !user) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="flex items-center gap-4 bg-card/80 p-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Trickster</title>
        <meta name="description" content="A modern, engaging digital experience for card game scoring." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="mesh-gradient" />
          <AppHeader />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
