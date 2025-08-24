
"use server";

import { revalidatePath } from "next/cache";
import { getBidSuggestion } from "@/ai/flows/smart-bidding-advisor";
import type { Player, BidSuggestion } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export async function findUserByEmail(email: string): Promise<{ uid: string; name: string; email: string } | null> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    return {
      uid: querySnapshot.docs[0].id,
      name: userData.name,
      email: userData.email,
    };
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}
