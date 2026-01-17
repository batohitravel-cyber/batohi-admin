'use client';

import { useState, useEffect, useTransition } from 'react';
import StatCard from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, MessageCircle, TrendingUp, Send, Loader2, Database, Save, FileJson } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { saveBatohiQuery, getBatohiAnalytics, getTrendingQuestions, saveBatohiTrainingData } from '@/lib/server-actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";

const PREDEFINED_PROMPTS = [
  "What is the history of Golghar?",
  "Tell me about famous festivals in Bihar."
];

export default function AiPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({ totalQueries: 0, accuracy: '0%', rating: '0/0' });
  const [trending, setTrending] = useState<{ query: string, count: number }[]>([]);
  const { toast } = useToast();

  // Manual Training State
  const [trainingQuestion, setTrainingQuestion] = useState('');
  const [trainingAnswer, setTrainingAnswer] = useState('');
  const [isTrainingPending, startTrainingTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      const analytics = await getBatohiAnalytics();
      setStats(analytics);
      const trendingData = await getTrendingQuestions();
      setTrending(trendingData);
    }
    fetchData();
  }, []);

  const handleAsk = (prompt: string) => {
    setQuery(prompt);
    setResponse('');

    startTransition(async () => {
      // Imitate AI processing delay
      let aiResponse = "I can certainly help you with that! Bihar has a rich culture and history.";
      if (prompt.includes("Golghar")) {
        aiResponse = "Golghar is a large granary in Patna, built by Captain John Garstin in 1786. It is 29 meters high and offers a panoramic view of the city and the Ganges.";
      } else if (prompt.includes("festivals")) {
        aiResponse = "Chhath Puja is the most famous festival in Bihar, dedicated to the Sun God. Other major festivals include Sama Chakeva, Bihula, and Makar Sankranti.";
      } else {
        aiResponse = `Response to: ${prompt}. Bihar is known for its ancient universities like Nalanda and Vikramshila.`;
      }

      await saveBatohiQuery(prompt, aiResponse);
      setResponse(aiResponse);

      // Refresh stats
      const analytics = await getBatohiAnalytics();
      setStats(analytics);
      const trendingData = await getTrendingQuestions();
      setTrending(trendingData);
    });
  };

  const handleSaveTrainingData = () => {
    if (!trainingQuestion || !trainingAnswer) return;

    startTrainingTransition(async () => {
      const result = await saveBatohiTrainingData({
        question: trainingQuestion,
        answer: trainingAnswer
      });

      if (result.success) {
        setTrainingQuestion('');
        setTrainingAnswer('');
        toast({
          title: "Training Data Saved",
          description: "Your input has been added to the training queue."
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ask Batohi AI
        </h1>
        <p className="text-muted-foreground">
          Interact with Batohi AI, view metrics, and manually train the bot.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Queries"
          value={stats.totalQueries.toString()}
          change="Real-time"
          icon={MessageCircle}
        />
        <StatCard
          title="AI Accuracy"
          value={stats.accuracy}
          change="Estimated"
          icon={CheckCircle}
        />
        <StatCard
          title="Avg. Session Rating"
          value={stats.rating}
          change="User Feedback"
          icon={Bot}
        />
      </div>

      <Tabs defaultValue="interact" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interact">Interact & Analytics</TabsTrigger>
          <TabsTrigger value="train">Manual Training</TabsTrigger>
        </TabsList>

        <TabsContent value="interact" className="flex flex-col gap-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
                <CardDescription>Select a query or type your own.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAsk(prompt)}
                      disabled={isPending}
                      className="bg-secondary/50 hover:bg-secondary"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isPending}
                  />
                  <Button onClick={() => handleAsk(query)} disabled={!query || isPending}>
                    {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
              {response && (
                <CardFooter className="bg-muted/30 p-4 rounded-b-lg block border-t">
                  <p className="font-semibold text-sm text-primary mb-1">Batohi AI:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{response}</p>
                </CardFooter>
              )}
            </Card>

            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Questions
                </CardTitle>
                <CardDescription>
                  Most frequently asked questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trending.length > 0 ? trending.map((q) => (
                      <TableRow key={q.query}>
                        <TableCell className="font-medium text-xs break-words">{q.query}</TableCell>
                        <TableCell className="text-right">
                          {q.count}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                          No queries recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="train" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Manual Training Data
              </CardTitle>
              <CardDescription>
                Manually input question-answer pairs to train the bot. This data is stored in JSON format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question / User Query</label>
                <Input
                  placeholder="e.g. What is the ticket price for Patna Museum?"
                  value={trainingQuestion}
                  onChange={(e) => setTrainingQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Answer / Bot Response</label>
                <Textarea
                  placeholder="e.g. The ticket price for Patna Museum is ₹20 for Indians and ₹250 for foreigners."
                  className="min-h-[100px]"
                  value={trainingAnswer}
                  onChange={(e) => setTrainingAnswer(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileJson className="h-4 w-4" />
                <span>Data stored as JSONB in 'ai_training_data'</span>
              </div>
              <Button
                onClick={handleSaveTrainingData}
                disabled={!trainingQuestion || !trainingAnswer || isTrainingPending}
              >
                {isTrainingPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Training Data
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
