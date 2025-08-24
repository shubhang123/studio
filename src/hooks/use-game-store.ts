"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Player, GameState, PlayerSetup } from '@/types';
import { calculateScores, checkForPerfectGameBonus } from '@/lib/game-logic';

type GameStore = {
  currentGame: GameState | null;
  gameHistory: GameState[];
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


export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      gameHistory: [],

      startNewGame: () => {
        set({ currentGame: getInitialState() });
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
        
        set((state) => ({
          currentGame: {
            ...(state.currentGame ?? getInitialState()),
            players: newPlayers,
            startingCardCount,
            currentRound: 1,
            gamePhase: 'bidding',
            timestamp: Date.now(),
          }
        }));
      },

      restartGame: () => {
        const currentGame = get().currentGame;
        if (!currentGame) return;
        
        const playerSetups = currentGame.players.map(p => ({ name: p.name, avatarColor: p.avatarColor }));
        const startingCardCount = currentGame.startingCardCount;

        get().startGame(playerSetups, startingCardCount);
      },

      endGame: () => {
        set((state) => {
            if (!state.currentGame) return {};
            
            let finalPlayers = checkForPerfectGameBonus(state.currentGame.players, state.currentGame.startingCardCount);

            const finalGameState = {
                ...state.currentGame,
                players: finalPlayers,
                gamePhase: 'game-over' as const
            };
            
            return {
                gameHistory: [...state.gameHistory, finalGameState],
                currentGame: finalGameState,
            };
        });
      },

      setGamePhase: (phase) => {
        set((state) => {
          if (!state.currentGame) return {};
          return {
            currentGame: {
              ...state.currentGame,
              gamePhase: phase,
            },
          };
        });
      },

      updateBid: (playerId, bid) => {
        set((state) => {
          if (!state.currentGame) return {};
          const updatedPlayers = state.currentGame.players.map((p) =>
            p.id === playerId ? { ...p, currentBid: bid } : p
          );
          return {
            currentGame: { ...state.currentGame, players: updatedPlayers },
          };
        });
      },

      updateTricks: (playerId, tricks) => {
        set((state) => {
          if (!state.currentGame) return {};
          const updatedPlayers = state.currentGame.players.map((p) =>
            p.id === playerId ? { ...p, currentTricks: tricks } : p
          );
          return {
            currentGame: { ...state.currentGame, players: updatedPlayers },
          };
        });
      },

      scoreRound: () => {
        set(state => {
            if (!state.currentGame) return {};
            const { players, currentRound } = state.currentGame;
            const updatedPlayers = calculateScores(players, currentRound);
            return {
                currentGame: {
                    ...state.currentGame,
                    players: updatedPlayers,
                }
            }
        })
      },

      nextRound: () => {
        set(state => {
            if (!state.currentGame) return {};
            const nextRoundNumber = state.currentGame.currentRound + 1;
            const dealerIndex = (state.currentGame.currentRound) % state.currentGame.players.length;

            const playersForNextRound = state.currentGame.players.map((p, index) => ({
                ...p,
                currentBid: null,
                currentTricks: null,
                isBidSuccessful: null,
                isDealer: index === dealerIndex,
            }));

            return {
                currentGame: {
                    ...state.currentGame,
                    players: playersForNextRound,
                    currentRound: nextRoundNumber,
                    gamePhase: 'bidding',
                }
            }
        })
      }
    }),
    {
      name: 'trickster-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
