
"use client";


import GameBoard from '@/components/game-board';
import { DiamondIcon } from '@/components/icons';
import { useGameStore } from '@/hooks/use-game-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';


function GamePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('id');

    const { user, loading: authLoading } = useAuth();
    const { 
        currentGame, 
        loadGame, 
        clearCurrentGame,
        isGameLoading,
    } = useGameStore();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
        } else if (!authLoading && user && gameId) {
            loadGame(gameId);
        } else if (!authLoading && user && !gameId) {
            router.push('/');
        }
        // Cleanup when component unmounts or gameId changes
        return () => {
            if (gameId) {
                clearCurrentGame();
            }
        };
    }, [gameId, user, authLoading, router, loadGame, clearCurrentGame]);

    const handleRestart = useCallback(() => {
        router.push('/setup');
    }, [router]);

    if (authLoading || isGameLoading || !currentGame) {
        return (
             <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
                <header className="w-full max-w-7xl flex items-center justify-center mb-8 pt-8">
                    <DiamondIcon className="h-10 w-10 text-primary" />
                    <h1 className="text-4xl md:text-5xl font-headline font-bold ml-4">
                    Trickster
                    </h1>
                </header>
                <div className="w-full max-w-7xl space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
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

export default function GamePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GamePageContent />
        </Suspense>
    );
}
