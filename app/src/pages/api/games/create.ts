import type { NextApiRequest, NextApiResponse } from 'next';
import type { Player, PlayerSetup, GameConfig, GameState } from "@/types";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { nanoid } from 'nanoid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ gameId: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { playerSetups, startingCardCount, config, hostId } = req.body as {
    playerSetups: PlayerSetup[],
    startingCardCount: number,
    config: GameConfig,
    hostId: string
  };

  const newPlayers: Player[] = playerSetups.map((setup, index) => ({
    ...setup,
    id: setup.uid || nanoid(),
    totalScore: 0,
    bidHistory: [],
    currentBid: null,
    currentTricks: null,
    streak: 0,
    isBidSuccessful: null,
    isDealer: index === 0,
    isGuest: !setup.uid,
  }));

  const newGame: Omit<GameState, 'id'> = {
    players: newPlayers,
    playerIds: playerSetups.filter(p => p.uid && !p.isGuest).map(p => p.uid!),
    hostId: hostId,
    currentRound: 1,
    startingCardCount,
    gamePhase: 'bidding',
    timestamp: Date.now(),
    config,
  };

  try {
    const docRef = await addDoc(collection(db, "games"), newGame);
    res.status(201).json({ gameId: docRef.id });
  } catch (error) {
    console.error("Error creating new game:", error);
    res.status(500).json({ error: "Failed to create game." });
  }
}
