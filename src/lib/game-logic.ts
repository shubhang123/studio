import type { Player, GameConfig } from '@/types';

export const calculateScores = (players: Player[], round: number, config: GameConfig): Player[] => {
  return players.map(player => {
    const bid = player.currentBid;
    const tricks = player.currentTricks;
    let roundScore = 0;
    let newStreak = player.streak;
    let bidSuccessful = false;

    if (bid !== null && tricks !== null) {
      if (bid === tricks) {
        bidSuccessful = true;
        // Updated scoring formula: If bid made successfully, (bid + 1) × 10 + bid.
        roundScore = (tricks + 1) * 10 + tricks;
        newStreak++;

        // Add streak bonuses if enabled
        if (config.enableStreakBonus) {
          if (newStreak === 3) roundScore += 10;
          if (newStreak === 5) roundScore += 25;
          if (newStreak >= 7) roundScore += 50;
        }

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

export const checkForPerfectGameBonus = (players: Player[], totalRounds: number, config: GameConfig): Player[] => {
    if (!config.enablePerfectGameBonus) return players;

    return players.map(player => {
        const allBidsSuccessful = player.bidHistory.every(h => h.bid === h.tricks);
        // A perfect game requires making a successful bid in every round.
        if (allBidsSuccessful && player.bidHistory.length === totalRounds) {
            return {
                ...player,
                totalScore: player.totalScore + 50,
            };
        }
        return player;
    });
};
