'use server';

/**
 * @fileOverview Implements an AI-powered spam review and query filter.
 *
 * - aiSpamReview - A function that filters spam reviews and queries.
 * - AISpamReviewInput - The input type for the aiSpamReview function.
 * - AISpamReviewOutput - The return type for the aiSpamReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISpamReviewInputSchema = z.object({
  text: z.string().describe('The text to check for spam.'),
});
export type AISpamReviewInput = z.infer<typeof AISpamReviewInputSchema>;

const AISpamReviewOutputSchema = z.object({
  isSpam: z.boolean().describe('Whether the text is spam or not.'),
  reason: z.string().describe('The reason why the text is considered spam.'),
});
export type AISpamReviewOutput = z.infer<typeof AISpamReviewOutputSchema>;

export async function aiSpamReview(input: AISpamReviewInput): Promise<AISpamReviewOutput> {
  return aiSpamReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSpamReviewPrompt',
  input: {schema: AISpamReviewInputSchema},
  output: {schema: AISpamReviewOutputSchema},
  prompt: `You are a spam filter. You will receive a text input and you will determine if it is spam or not.

  Respond with a JSON object that has two fields:
  - isSpam: true if the text is spam, false otherwise.
  - reason: The reason why the text is considered spam.

  Text: {{{text}}}`,
});

const aiSpamReviewFlow = ai.defineFlow(
  {
    name: 'aiSpamReviewFlow',
    inputSchema: AISpamReviewInputSchema,
    outputSchema: AISpamReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
