"use client";

import GameSetup from '@/components/game-setup';
import { DiamondIcon } from '@/components/icons';
import { useRouter } from 'next/router';
import type { PlayerSetup, GameConfig } from '@/types';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function SetupPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [router, user, loading]);

    const handleStartGame = async (playerSetups: PlayerSetup[], cards: number, config: GameConfig) => {
        if (!user) return;
        try {
            const response = await fetch('/api/games/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerSetups,
                    startingCardCount: cards,
                    config,
                    hostId: user.uid,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create game');
            }

            const { gameId } = await response.json();
            router.push(`/game?id=${gameId}`);
        } catch (error) {
            toast({
                title: 'Error Starting Game',
                description: 'Could not create a new game. Please try again.',
                variant: 'destructive',
            })
        }
    }
    
    if (loading || !user) {
        return null; // Or a loading skeleton
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
            <header className="w-full max-w-7xl flex items-center justify-center mb-8 pt-8">
                <DiamondIcon className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
                Trickster
                </h1>
            </header>
            <div className="w-full max-w-7xl">
                <GameSetup onStartGame={handleStartGame} />
            </div>
        </div>
    )
}
