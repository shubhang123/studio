import type { NextApiRequest, NextApiResponse } from 'next';
import type { LeaderboardPlayer } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardPlayer[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const leaderboardRef = collection(db, "leaderboard");
    const q = query(leaderboardRef, orderBy("gamesWon", "desc"), orderBy("totalPoints", "desc"));
    const querySnapshot = await getDocs(q);

    const leaderboard: LeaderboardPlayer[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ uid: doc.id, ...doc.data() } as LeaderboardPlayer);
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
}
