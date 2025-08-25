import { create } from 'zustand';
import type { Player, GameState } from '@/types';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function updateUserStats(players: Player[]) {
  try {
    await fetch('/api/leaderboard/update-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

type GameStore = {
  currentGame: GameState | null;
  isGameLoading: boolean;
  loadGame: (gameId: string) => void;
  clearCurrentGame: () => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  updateBid: (playerId: string, bid: number | null) => void;
  updateTricks: (playerId: string, tricks: number | null) => void;
  scoreRound: () => void;
  nextRound: () => void;
  endGame: () => void;
};

let firestoreUnsubscribe: (() => void) | null = null;

export const useGameStore = create<GameStore>()((set, get) => ({
  currentGame: null,
  isGameLoading: true,

  loadGame: (gameId) => {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }
    set({ isGameLoading: true });
    
    const docRef = doc(db, 'games', gameId);

    firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = { id: docSnap.id, ...docSnap.data() } as GameState;
        set({ currentGame: gameData, isGameLoading: false });
      } else {
        console.error("Game not found!");
        set({ currentGame: null, isGameLoading: false });
      }
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      set({ currentGame: null, isGameLoading: false });
    });
  },

  clearCurrentGame: () => {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }
    set({ currentGame: null });
  },

  setGamePhase: async (phase) => {
    const { currentGame } = get();
    if (!currentGame) return;
    try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { gamePhase: phase });
    } catch (error) {
      console.error("Error updating game phase:", error);
    }
  },

  updateBid: async (playerId, bid) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const updatedPlayers = currentGame.players.map((p) =>
      p.id === playerId ? { ...p, currentBid: bid } : p
    );

    try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { players: updatedPlayers });
    } catch (error)      {
      console.error("Error updating bid:", error);
    }
  },

  updateTricks: async (playerId, tricks) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const updatedPlayers = currentGame.players.map((p) =>
      p.id === playerId ? { ...p, currentTricks: tricks } : p
    );
     try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { players: updatedPlayers });
    } catch (error)      {
      console.error("Error updating tricks:", error);
    }
  },

  scoreRound: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    const { players, currentRound, config } = currentGame;
    const updatedPlayers = calculateScores(players, currentRound, config);
    
     try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { players: updatedPlayers });
    } catch (error)      {
      console.error("Error scoring round:", error);
    }
  },

  nextRound: async () => {
    const { currentGame } = get();
    if (!currentGame) return;
    
    if (currentGame.currentRound >= currentGame.startingCardCount) {
        get().endGame();
        return;
    }

    const nextRoundNumber = currentGame.currentRound + 1;
    const dealerIndex = (currentGame.currentRound) % currentGame.players.length;

    const playersForNextRound = currentGame.players.map((p, index) => ({
        ...p,
        currentBid: null,
        currentTricks: null,
        isBidSuccessful: null,
        isDealer: index === dealerIndex,
    }));

     try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { 
          players: playersForNextRound,
          currentRound: nextRoundNumber,
          gamePhase: 'bidding'
      });
    } catch (error)      {
      console.error("Error starting next round:", error);
    }
  },

  endGame: async () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.gamePhase === 'game-over') return;
    
    let finalPlayers = checkForPerfectGameBonus(
        currentGame.players, 
        currentGame.startingCardCount,
        currentGame.config
    );

    try {
      const gameRef = doc(db, 'games', currentGame.id);
      await updateDoc(gameRef, { 
          players: finalPlayers,
          gamePhase: 'game-over'
      });
      await updateUserStats(finalPlayers);
    } catch (error) {
      console.error("Error ending game:", error);
    }
  },
}));
