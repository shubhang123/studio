import type { Player } from '@/types';

export const calculateScores = (players: Player[], round: number): Player[] => {
  return players.map(player => {
    const bid = player.currentBid;
    const tricks = player.currentTricks;
    let roundScore = 0;
    let newStreak = player.streak;
    let bidSuccessful = false;

    if (bid !== null && tricks !== null) {
      if (bid === tricks) {
        bidSuccessful = true;
        // Corrected scoring formula: 10 points for a correct bid, plus the number of tricks.
        roundScore = 10 + tricks;
        newStreak++;

        // Add streak bonuses
        if (newStreak === 3) roundScore += 10;
        if (newStreak === 5) roundScore += 25;
        if (newStreak >= 7) roundScore += 50;

      } else {
        newStreak = 0;
      }

      const newHistory = [
        ...player.bidHistory,
        { round, bid, tricks, score: roundScore },
      ];

      return {
        ...player,
        totalScore: player.totalScore + roundScore,
        bidHistory: newHistory,
        streak: newStreak,
        isBidSuccessful: bidSuccessful,
      };
    }
    return player;
  });
};

export const checkForPerfectGameBonus = (players: Player[]): Player[] => {
    return players.map(player => {
        const allBidsSuccessful = player.bidHistory.every(h => h.bid === h.tricks);
        if (allBidsSuccessful && player.bidHistory.length > 0) { // Ensure there's history to check
            return {
                ...player,
                totalScore: player.totalScore + 50,
            };
        }
        return player;
    });
};
