'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { MessageSquare, Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { answerEventQuestions } from '@/ai/flows/answer-event-questions';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleInitialQuery = async () => {
    if (messages.length === 0 && !isLoading) {
      const question = "What's happening this week?";
      setMessages([{ sender: 'user', text: question }]);
      setIsLoading(true);
      try {
        const result = await answerEventQuestions({ question });
        setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
      } catch (error) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I had trouble finding an answer. Please try again.' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const result = await answerEventQuestions({ question: currentInput });
      setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I had trouble finding an answer. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={handleInitialQuery}>
          <MessageSquare className="mr-0 h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>AI Event Assistant</SheetTitle>
          <SheetDescription>Ask me anything about campus tech events!</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mr-4 pr-4" ref={scrollAreaRef as any}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                <div className="rounded-lg px-4 py-2 text-sm bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="w-full relative">
            <Input 
              placeholder="Ask a question..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
