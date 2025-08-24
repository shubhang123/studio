"use server";

import { revalidatePath } from "next/cache";
import { getBidSuggestion } from "@/ai/flows/smart-bidding-advisor";
import type { Player, BidSuggestion } from "@/types";

interface GetBidSuggestionParams {
  player: Player;
  players: Player[];
  currentRound: number;
  startingCardCount: number;
}

export async function getAiBidSuggestion({
  player,
  players,
  currentRound,
  startingCardCount,
}: GetBidSuggestionParams): Promise<BidSuggestion | { error: string }> {
  try {
    const successfulBids = player.bidHistory.filter(h => h.bid === h.tricks).length;
    const biddingAccuracy = player.bidHistory.length > 0
      ? `${Math.round((successfulBids / player.bidHistory.length) * 100)}%`
      : "N/A";

    const playerStats = `Win/Loss Ratio: N/A, Bidding Accuracy: ${biddingAccuracy}, Current Streak: ${player.streak}`;
    
    const otherPlayersState = players
      .filter(p => p.id !== player.id)
      .map(p => `${p.name}: ${p.totalScore} pts, Current Bid: ${p.currentBid ?? 'N/A'}`)
      .join('; ');

    const gameState = `Current Scores: ${players.map(p => `${p.name}: ${p.totalScore}`).join(', ')}. Other players info: ${otherPlayersState}`;

    const suggestion = await getBidSuggestion({
      handSize: (startingCardCount + 1) - currentRound,
      currentRound: currentRound,
      playerStats: playerStats,
      gameState: gameState,
    });

    return suggestion;
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion from AI." };
  }
}

export async function passTurn(players: Player[], currentPlayerId: string) {
    const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
    
    if (currentPlayerIndex === -1) {
        return players; // Should not happen
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    const updatedPlayers = players.map((player, index) => ({
        ...player,
        isTurn: index === nextPlayerIndex,
    }));

    return updatedPlayers;
}
