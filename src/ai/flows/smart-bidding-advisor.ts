'use server';
/**
 * @fileOverview An AI agent that advises players on optimal bidding strategies.
 *
 * - getBidSuggestion - A function that suggests the best bid for a player.
 * - BidSuggestionInput - The input type for the getBidSuggestion function.
 * - BidSuggestionOutput - The return type for the getBidSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BidSuggestionInputSchema = z.object({
  handSize: z.number().describe('The number of cards in the player\'s hand.'),
  currentRound: z.number().describe('The current round number of the game.'),
  playerStats: z
    .string()
    .describe('Statistics about the player, such as win/loss ratio and bidding accuracy.'),
  gameState: z.string().describe('The current state of the game.'),
});
export type BidSuggestionInput = z.infer<typeof BidSuggestionInputSchema>;

const BidSuggestionOutputSchema = z.object({
  suggestedBid: z
    .number()
    .describe('The AI-suggested optimal bid for the player, given the current game conditions.'),
  reasoning: z
    .string()
    .describe('The AI\'s reasoning behind the suggested bid, including factors considered.'),
});
export type BidSuggestionOutput = z.infer<typeof BidSuggestionOutputSchema>;

export async function getBidSuggestion(input: BidSuggestionInput): Promise<BidSuggestionOutput> {
  return bidSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bidSuggestionPrompt',
  input: {schema: BidSuggestionInputSchema},
  output: {schema: BidSuggestionOutputSchema},
  prompt: `You are an AI-powered bidding advisor for the card game Trickster.

  Based on the current game conditions and the player\'s statistics, provide a suggested bid and the reasoning behind it.

  Consider the following factors:
  - Hand size: {{{handSize}}}
  - Current round: {{{currentRound}}}
  - Player stats: {{{playerStats}}}
  - Game state: {{{gameState}}}

  Provide the suggested bid and reasoning in a clear and concise manner.
  `,
});

const bidSuggestionFlow = ai.defineFlow(
  {
    name: 'bidSuggestionFlow',
    inputSchema: BidSuggestionInputSchema,
    outputSchema: BidSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
