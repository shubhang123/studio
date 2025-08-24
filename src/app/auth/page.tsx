
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DiamondIcon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { signUp, signIn } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setIsLoading(true);
    try {
      const authFunction = action === 'signIn' ? signIn : signUp;
      await authFunction(email, password);
      router.push('/');
      toast({
        title: `Successfully ${action === 'signIn' ? 'signed in' : 'signed up'}!`,
        description: 'Welcome back to Trickster.',
      });
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center">
       <header className="w-full max-w-7xl flex items-center justify-center mb-8 pt-8">
        <DiamondIcon className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
          Trickster
        </h1>
      </header>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account to start playing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <div className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            <TabsContent value="signin">
                <Button onClick={() => handleAuthAction('signIn')} disabled={isLoading} className="w-full mt-4">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </TabsContent>
            <TabsContent value="signup">
               <Button onClick={() => handleAuthAction('signUp')} disabled={isLoading} className="w-full mt-4">
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
