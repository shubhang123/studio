
"use server";

import { revalidatePath } from "next/cache";
import { getBidSuggestion } from "@/ai/flows/smart-bidding-advisor";
import type { Player, BidSuggestion, LeaderboardPlayer } from "@/types";
import { collection, getDocs, query, where, doc, getDoc, runTransaction, orderBy } from "firebase/firestore";
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

export async function updateUserStats(players: Player[]) {
  try {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers[0];

    await runTransaction(db, async (transaction) => {
      for (const player of players) {
        const playerRef = doc(db, "leaderboard", player.uid);
        const userRef = doc(db, "users", player.uid);

        const [playerDoc, userDoc] = await Promise.all([
            transaction.get(playerRef),
            transaction.get(userRef)
        ]);
        
        const userData = userDoc.data();
        if (!userData) continue;

        const isWinner = player.uid === winner.uid;
        
        if (!playerDoc.exists()) {
          transaction.set(playerRef, {
            name: userData.name,
            email: userData.email,
            gamesPlayed: 1,
            gamesWon: isWinner ? 1 : 0,
            totalPoints: player.totalScore,
            bidSuccessRate: player.bidHistory.filter(h => h.bid === h.tricks).length / player.bidHistory.length,
          });
        } else {
          const currentStats = playerDoc.data();
          const totalSuccessfulBids = (currentStats.bidSuccessRate * currentStats.gamesPlayed * 10) + player.bidHistory.filter(h => h.bid === h.tricks).length; // Approximation
          const totalBids = (currentStats.gamesPlayed * 10) + player.bidHistory.length;

          transaction.update(playerRef, {
            gamesPlayed: currentStats.gamesPlayed + 1,
            gamesWon: currentStats.gamesWon + (isWinner ? 1 : 0),
            totalPoints: currentStats.totalPoints + player.totalScore,
            bidSuccessRate: totalBids > 0 ? totalSuccessfulBids / totalBids : 0,
          });
        }
      }
    });
    revalidatePath('/leaderboard');
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

export async function getLeaderboard(): Promise<LeaderboardPlayer[]> {
  try {
    const leaderboardRef = collection(db, "leaderboard");
    const q = query(leaderboardRef, orderBy("gamesWon", "desc"), orderBy("totalPoints", "desc"));
    const querySnapshot = await getDocs(q);

    const leaderboard: LeaderboardPlayer[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ uid: doc.id, ...doc.data() } as LeaderboardPlayer);
    });

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
