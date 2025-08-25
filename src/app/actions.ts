
"use server";

import { revalidatePath } from "next/cache";
import { getBidSuggestion } from "@/ai/flows/smart-bidding-advisor";
import type { Player, BidSuggestion, LeaderboardPlayer, GameState, PlayerSetup, GameConfig } from "@/types";
import { collection, getDocs, query, where, doc, getDoc, runTransaction, orderBy, writeBatch, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GetBidSuggestionParams {
  player: Player;
  players: Player[];
  currentRound: number;
  startingCardCount: number;
}

export async function createNewGame(playerSetups: PlayerSetup[], startingCardCount: number, config: GameConfig, hostId: string): Promise<string> {
  const newPlayers: Player[] = playerSetups.map((setup, index) => ({
    ...setup,
    id: setup.uid,
    totalScore: 0,
    bidHistory: [],
    currentBid: null,
    currentTricks: null,
    streak: 0,
    isBidSuccessful: null,
    isDealer: index === 0,
  }));

  const newGame: Omit<GameState, 'id'> = {
    players: newPlayers,
    playerIds: playerSetups.map(p => p.uid),
    hostId: hostId,
    currentRound: 1,
    startingCardCount,
    gamePhase: 'bidding',
    timestamp: Date.now(),
    config,
  };

  try {
    const docRef = await addDoc(collection(db, "games"), newGame);
    return docRef.id;
  } catch (error) {
    console.error("Error creating new game:", error);
    throw new Error("Failed to create game.");
  }
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
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
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
    if (players.length === 0) return;
    
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers[0];

    await runTransaction(db, async (transaction) => {
      for (const player of players) {
        if (!player.uid) continue;
        
        const playerRef = doc(db, "leaderboard", player.uid);
        const userRef = doc(db, "users", player.uid);

        const [playerDoc, userDoc] = await Promise.all([
            transaction.get(playerRef),
            transaction.get(userDoc)
        ]);
        
        const userData = userDoc.data();
        if (!userData) continue;

        const isWinner = player.uid === winner.uid;
        
        const successfulBidsInGame = player.bidHistory.filter(h => h.bid === h.tricks).length;
        const totalBidsInGame = player.bidHistory.length;

        if (!playerDoc.exists()) {
          transaction.set(playerRef, {
            name: userData.name,
            email: userData.email,
            gamesPlayed: 1,
            gamesWon: isWinner ? 1 : 0,
            totalPoints: player.totalScore,
            totalBidsMade: totalBidsInGame,
            totalBidsSuccess: successfulBidsInGame,
          });
        } else {
          const currentStats = playerDoc.data() as Omit<LeaderboardPlayer, 'uid'>;
          const newTotalBidsMade = (currentStats.totalBidsMade || 0) + totalBidsInGame;
          const newTotalBidsSuccess = (currentStats.totalBidsSuccess || 0) + successfulBidsInGame;

          transaction.update(playerRef, {
            gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
            gamesWon: (currentStats.gamesWon || 0) + (isWinner ? 1 : 0),
            totalPoints: (currentStats.totalPoints || 0) + player.totalScore,
            totalBidsMade: newTotalBidsMade,
            totalBidsSuccess: newTotalBidsSuccess,
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

export async function getActiveGames(userId: string): Promise<GameState[]> {
    if (!userId) return [];
    try {
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, where("playerIds", "array-contains", userId));
        const querySnapshot = await getDocs(q);

        const games: GameState[] = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().gamePhase !== 'game-over') {
                 games.push({ id: doc.id, ...doc.data() } as GameState);
            }
        });
        return games;
    } catch (error) {
        console.error("Error fetching active games:", error);
        return [];
    }
}
