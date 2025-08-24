
"use client";

import GameSetup from '@/components/game-setup';
import { DiamondIcon } from '@/components/icons';
import { useGameStore } from '@/hooks/use-game-store';
import { useRouter } from 'next/navigation';
import type { PlayerSetup } from '@/types';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function SetupPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { startGame, currentGame } = useGameStore();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        } else if (!loading && user && (!currentGame || (currentGame.players.length > 0 && currentGame.gamePhase !== 'setup'))) {
             router.push('/');
        }
    }, [currentGame, router, user, loading]);


    const handleStartGame = (playerSetups: PlayerSetup[], cards: number) => {
        startGame(playerSetups, cards);
        router.push('/game');
    }
    
    if (loading || !user) {
        return null;
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
