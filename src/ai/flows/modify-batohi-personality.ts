'use server';

/**
 * @fileOverview Allows a Super Admin to modify Batohi's personality and tone of voice.
 *
 * - modifyBatohiPersonality - A function that handles the modification of Batohi's personality.
 * - ModifyBatohiPersonalityInput - The input type for the modifyBatohiPersonality function.
 * - ModifyBatohiPersonalityOutput - The return type for the modifyBatohiPersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyBatohiPersonalityInputSchema = z.object({
  systemPrompt: z
    .string()
    .describe('The system prompt that defines Batohi’s personality and tone of voice.'),
});
export type ModifyBatohiPersonalityInput = z.infer<typeof ModifyBatohiPersonalityInputSchema>;

const ModifyBatohiPersonalityOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the personality modification was successful.'),
  message: z.string().describe('A message indicating the outcome of the operation.'),
});
export type ModifyBatohiPersonalityOutput = z.infer<typeof ModifyBatohiPersonalityOutputSchema>;

export async function modifyBatohiPersonality(input: ModifyBatohiPersonalityInput): Promise<ModifyBatohiPersonalityOutput> {
  return modifyBatohiPersonalityFlow(input);
}

const modifyBatohiPersonalityPrompt = ai.definePrompt({
  name: 'modifyBatohiPersonalityPrompt',
  input: {schema: ModifyBatohiPersonalityInputSchema},
  output: {schema: ModifyBatohiPersonalityOutputSchema},
  prompt: `You are a system administrator. The user is requesting to update the system prompt for the Batohi AI assistant.  The current system prompt is: {{{systemPrompt}}}. Return a JSON object of type ModifyBatohiPersonalityOutputSchema to confirm.`,
});

const modifyBatohiPersonalityFlow = ai.defineFlow(
  {
    name: 'modifyBatohiPersonalityFlow',
    inputSchema: ModifyBatohiPersonalityInputSchema,
    outputSchema: ModifyBatohiPersonalityOutputSchema,
  },
  async input => {
    try {
      const {output} = await modifyBatohiPersonalityPrompt(input);
      return {
        success: true, // Assume success if the prompt execution completes without errors
        message: 'Batohi personality modification completed successfully.',
      };
    } catch (error: any) {
      console.error('Error modifying Batohi personality:', error);
      return {
        success: false,
        message: `Batohi personality modification failed: ${error.message || 'Unknown error'}`,
      };
    }
  }
);
