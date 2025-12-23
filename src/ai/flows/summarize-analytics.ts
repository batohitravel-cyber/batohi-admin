'use server';

/**
 * @fileOverview AI agent that summarizes key analytics for the admin dashboard.
 *
 * - summarizeAnalytics - A function that generates a summary of the key analytics.
 * - SummarizeAnalyticsInput - The input type for the summarizeAnalytics function (currently empty).
 * - SummarizeAnalyticsOutput - The return type for the summarizeAnalytics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnalyticsInputSchema = z.object({});
export type SummarizeAnalyticsInput = z.infer<typeof SummarizeAnalyticsInputSchema>;

const SummarizeAnalyticsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the most important analytics data.'),
});
export type SummarizeAnalyticsOutput = z.infer<typeof SummarizeAnalyticsOutputSchema>;

export async function summarizeAnalytics(input: SummarizeAnalyticsInput): Promise<SummarizeAnalyticsOutput> {
  return summarizeAnalyticsFlow(input);
}

const summarizeAnalyticsPrompt = ai.definePrompt({
  name: 'summarizeAnalyticsPrompt',
  input: {schema: SummarizeAnalyticsInputSchema},
  output: {schema: SummarizeAnalyticsOutputSchema},
  prompt: `You are an AI assistant helping a Super Admin understand the most important trends from their dashboard analytics.

  Provide a concise summary of the most important analytics, including Daily Active Users (DAU), Monthly Active Users (MAU), Top Searched Places, Top Visited Attractions, AI Chatbot insights (most asked queries, chat success rate), and Content performance metrics (audio story listens, saves/shares, page engagement time).
  Focus on key trends and actionable insights that the Super Admin should focus on to improve the platform.
  
  Do not make up any data; only provide a summary based on the analytics data available.
  `,
});

const summarizeAnalyticsFlow = ai.defineFlow(
  {
    name: 'summarizeAnalyticsFlow',
    inputSchema: SummarizeAnalyticsInputSchema,
    outputSchema: SummarizeAnalyticsOutputSchema,
  },
  async input => {
    const {output} = await summarizeAnalyticsPrompt(input);
    return output!;
  }
);
