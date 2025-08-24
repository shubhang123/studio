"use client";

import GameBoard from '@/components/game-board';
import { DiamondIcon } from '@/components/icons';
import { useGameStore } from '@/hooks/use-game-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GamePage() {
    const router = useRouter();
    const { currentGame, endGame, restartGame } = useGameStore();

    useEffect(() => {
        if (!currentGame || currentGame.players.length === 0) {
            router.push('/');
        }
    }, [currentGame, router]);

    const handleRestart = () => {
        restartGame();
        router.push('/setup');
    }

    if (!currentGame || currentGame.players.length === 0) {
        // You can show a loading spinner here
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
                <GameBoard 
                    game={currentGame}
                    onRestartGame={handleRestart} 
                />
            </div>
        </div>
    )
}
