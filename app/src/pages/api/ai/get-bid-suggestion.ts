import type { NextApiRequest, NextApiResponse } from 'next';
import { getBidSuggestion } from '@/ai/flows/smart-bidding-advisor';
import type { Player, BidSuggestion } from "@/types";

interface GetBidSuggestionParams {
  player: Player;
  players: Player[];
  currentRound: number;
  startingCardCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BidSuggestion | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { player, players, currentRound, startingCardCount } = req.body as GetBidSuggestionParams;

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

    res.status(200).json(suggestion);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get suggestion from AI." });
  }
}
