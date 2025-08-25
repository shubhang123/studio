import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';

function AppHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  }

  // Do not render header on the auth page
  if (router.pathname === '/auth') {
    return null;
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


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="mesh-gradient" />
      <AppHeader />
      <main>
        <Component {...pageProps} />
      </main>
      <Toaster />
    </AuthProvider>
  );
}

export default MyApp;
