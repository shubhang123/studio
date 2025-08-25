import type { NextApiRequest, NextApiResponse } from 'next';
import type { GameState } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameState[] | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId is required' });
    }
    
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
        res.status(200).json(games);
    } catch (error) {
        console.error("Error fetching active games:", error);
        res.status(500).json({ error: 'Failed to fetch active games' });
    }
}
