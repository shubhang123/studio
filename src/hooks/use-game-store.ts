
import { create } from 'zustand';
import type { Player, GameState, PlayerSetup } from '@/types';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type GameStore = {
  currentGame: GameState | null;
  gameHistory: GameState[];
  isInitialized: boolean;
  initializeFirestore: (userId: string) => void;
  clearStore: () => void;
  startNewGame: () => void;
  startGame: (playerSetups: PlayerSetup[], startingCardCount: number) => void;
  restartGame: () => void;
  endGame: () => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  updateBid: (playerId: string, bid: number | null) => void;
  updateTricks: (playerId: string, tricks: number | null) => void;
  scoreRound: () => void;
  nextRound: () => void;
};

const getInitialState = (): GameState => ({
    id: `game_${Date.now()}`,
    players: [],
    currentRound: 1,
    startingCardCount: 13,
    gamePhase: 'setup',
    timestamp: Date.now(),
});

let firestoreUnsubscribe: (() => void) | null = null;
let userId: string | null = null;

const saveStateToFirestore = async (state: { currentGame: GameState | null, gameHistory: GameState[] }) => {
  if (!userId) return;
  try {
    const docRef = doc(db, 'userGames', userId);
    await setDoc(docRef, {
      currentGame: state.currentGame,
      gameHistory: state.gameHistory,
    });
  } catch (error) {
    console.error("Error saving state to Firestore: ", error);
  }
};

export const useGameStore = create<GameStore>()((set, get) => ({
  currentGame: null,
  gameHistory: [],
  isInitialized: false,

  initializeFirestore: async (uid) => {
    if (get().isInitialized) return;
    userId = uid;
    
    if (firestoreUnsubscribe) firestoreUnsubscribe();

    const docRef = doc(db, 'userGames', userId);

    firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ currentGame: data.currentGame, gameHistory: data.gameHistory, isInitialized: true });
      } else {
         // If no data, initialize with empty state
        set({ currentGame: null, gameHistory: [], isInitialized: true });
      }
    });
  },

  clearStore: () => {
    if (firestoreUnsubscribe) firestoreUnsubscribe();
    userId = null;
    set({ currentGame: null, gameHistory: [], isInitialized: false });
  },

  startNewGame: () => {
    const newState = { currentGame: getInitialState(), gameHistory: get().gameHistory };
    set({ currentGame: newState.currentGame });
    saveStateToFirestore(newState);
  },
  
  startGame: (playerSetups, startingCardCount) => {
    const newPlayers: Player[] = playerSetups.map((setup, index) => ({
      ...setup,
      id: crypto.randomUUID(),
      totalScore: 0,
      bidHistory: [],
      currentBid: null,
      currentTricks: null,
      streak: 0,
      isBidSuccessful: null,
      isDealer: index === 0,
    }));
    
    const newCurrentGame = {
      ...(get().currentGame ?? getInitialState()),
      players: newPlayers,
      startingCardCount,
      currentRound: 1,
      gamePhase: 'bidding' as const,
      timestamp: Date.now(),
    };

    const newState = { currentGame: newCurrentGame, gameHistory: get().gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  },

  restartGame: () => {
    const currentGame = get().currentGame;
    if (!currentGame) return;
    
    const playerSetups = currentGame.players.map(p => ({ name: p.name, avatarColor: p.avatarColor }));
    const startingCardCount = currentGame.startingCardCount;

    get().startGame(playerSetups, startingCardCount);
  },

  endGame: () => {
    const state = get();
    if (!state.currentGame) return;
    
    let finalPlayers = checkForPerfectGameBonus(state.currentGame.players, state.currentGame.startingCardCount);

    const finalGameState = {
        ...state.currentGame,
        players: finalPlayers,
        gamePhase: 'game-over' as const
    };
    
    const newHistory = [...state.gameHistory, finalGameState];
    const newState = { currentGame: finalGameState, gameHistory: newHistory };

    set({ currentGame: finalGameState, gameHistory: newHistory });
    saveStateToFirestore(newState);
  },

  setGamePhase: (phase) => {
    const state = get();
    if (!state.currentGame) return;

    const newCurrentGame = { ...state.currentGame, gamePhase: phase };
    const newState = { currentGame: newCurrentGame, gameHistory: state.gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  },

  updateBid: (playerId, bid) => {
    const state = get();
    if (!state.currentGame) return;

    const updatedPlayers = state.currentGame.players.map((p) =>
      p.id === playerId ? { ...p, currentBid: bid } : p
    );
    
    const newCurrentGame = { ...state.currentGame, players: updatedPlayers };
    const newState = { currentGame: newCurrentGame, gameHistory: state.gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  },

  updateTricks: (playerId, tricks) => {
    const state = get();
    if (!state.currentGame) return;

    const updatedPlayers = state.currentGame.players.map((p) =>
      p.id === playerId ? { ...p, currentTricks: tricks } : p
    );

    const newCurrentGame = { ...state.currentGame, players: updatedPlayers };
    const newState = { currentGame: newCurrentGame, gameHistory: state.gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  },

  scoreRound: () => {
    const state = get();
    if (!state.currentGame) return;

    const { players, currentRound } = state.currentGame;
    const updatedPlayers = calculateScores(players, currentRound);
    
    const newCurrentGame = { ...state.currentGame, players: updatedPlayers };
    const newState = { currentGame: newCurrentGame, gameHistory: state.gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  },

  nextRound: () => {
    const state = get();
    if (!state.currentGame) return;

    const nextRoundNumber = state.currentGame.currentRound + 1;
    const dealerIndex = (state.currentGame.currentRound) % state.currentGame.players.length;

    const playersForNextRound = state.currentGame.players.map((p, index) => ({
        ...p,
        currentBid: null,
        currentTricks: null,
        isBidSuccessful: null,
        isDealer: index === dealerIndex,
    }));

    const newCurrentGame = {
        ...state.currentGame,
        players: playersForNextRound,
        currentRound: nextRoundNumber,
        gamePhase: 'bidding' as const,
    };
    const newState = { currentGame: newCurrentGame, gameHistory: state.gameHistory };
    set({ currentGame: newCurrentGame });
    saveStateToFirestore(newState);
  }
}));
