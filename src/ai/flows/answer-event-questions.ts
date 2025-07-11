'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about upcoming tech events.
 * The flow fetches event data from Firestore to provide accurate, up-to-date answers.
 *
 * - answerEventQuestions - A function that answers user questions about upcoming tech events.
 * - AnswerEventQuestionsInput - The input type for the answerEventQuestions function.
 * - AnswerEventQuestionsOutput - The return type for the answerEventQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { events as staticEvents } from '@/lib/events';
import type { Event } from '@/lib/types';

const AnswerEventQuestionsInputSchema = z.object({
  question: z.string().describe('The user question about upcoming tech events.'),
});
export type AnswerEventQuestionsInput = z.infer<typeof AnswerEventQuestionsInputSchema>;

const AnswerEventQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerEventQuestionsOutput = z.infer<typeof AnswerEventQuestionsOutputSchema>;

export async function answerEventQuestions(input: AnswerEventQuestionsInput): Promise<AnswerEventQuestionsOutput> {
  return answerEventQuestionsFlow(input);
}

const PromptInputSchema = z.object({
  question: z.string(),
  events: z.string().describe("A JSON string representing a list of available event objects."),
});

const prompt = ai.definePrompt({
  name: 'answerEventQuestionsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnswerEventQuestionsOutputSchema},
  prompt: `You are a helpful AI assistant for a campus events website called CampUsConnect.
Your role is to answer user questions based ONLY on the event data provided below.
Do not make up information. If the answer is not in the provided data, say that you don't have that information.
Be concise and friendly in your response.

Here is the list of upcoming events in JSON format:
{{{events}}}

Now, please answer the following user question.

Question: {{{question}}}`,
});

const answerEventQuestionsFlow = ai.defineFlow(
  {
    name: 'answerEventQuestionsFlow',
    inputSchema: AnswerEventQuestionsInputSchema,
    outputSchema: AnswerEventQuestionsOutputSchema,
  },
  async (input) => {
    // 1. Fetch events from Firestore and static data
    const eventsCollection = collection(db, 'events');
    const q = query(eventsCollection, orderBy('date', 'asc'));
    const eventsSnapshot = await getDocs(q);
    const firestoreEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];

    // 2. Combine and filter for upcoming events
    const allEvents = [...staticEvents, ...firestoreEvents]
      .filter(event => new Date(event.date) >= new Date(new Date().setDate(new Date().getDate() - 1)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3. Call the prompt with the question and event context
    const {output} = await prompt({
        question: input.question,
        events: JSON.stringify(allEvents, null, 2)
    });
    return output!;
  }
);
