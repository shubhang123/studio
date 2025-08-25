import type { NextApiRequest, NextApiResponse } from 'next';
import type { Player, LeaderboardPlayer } from "@/types";
import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { players } = req.body as { players: Player[] };

  try {
    const registeredPlayers = players.filter(p => p.uid && !p.isGuest);
    if (registeredPlayers.length === 0) {
      return res.status(200).json({ success: true });
    }
    
    const sortedPlayers = [...registeredPlayers].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

    await runTransaction(db, async (transaction) => {
      for (const player of registeredPlayers) {
        if (!player.uid) continue;
        
        const playerRef = doc(db, "leaderboard", player.uid);
        const userRef = doc(db, "users", player.uid);

        const [playerDoc, userDoc] = await Promise.all([
            transaction.get(playerRef),
            transaction.get(userDoc)
        ]);
        
        const userData = userDoc.data();
        if (!userData) continue;

        const isWinner = winner && player.uid === winner.uid;
        
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
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user stats:", error);
    res.status(500).json({ error: 'Failed to update user stats.' });
  }
}
