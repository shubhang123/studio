"use client";

import GameSetup from '@/components/game-setup';
import { DiamondIcon } from '@/components/icons';
import { useGameStore } from '@/hooks/use-game-store';
import { useRouter } from 'next/navigation';
import type { PlayerSetup } from '@/types';
import { useEffect } from 'react';

export default function SetupPage() {
    const router = useRouter();
    const { startGame, currentGame } = useGameStore();

    useEffect(() => {
        // Redirect if trying to access setup without a fresh game state
        if (!currentGame || (currentGame.players.length > 0 && currentGame.gamePhase !== 'setup')) {
            router.push('/');
        }
    }, [currentGame, router]);


    const handleStartGame = (playerSetups: PlayerSetup[], cards: number) => {
        startGame(playerSetups, cards);
        router.push('/game');
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
