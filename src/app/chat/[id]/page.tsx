
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, CornerDownLeft, User, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { chatAction, generateChatImageAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: string;
  name: string;
  persona: string;
  avatarUrl: string;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    imageUrl?: string;
    imagePrompt?: string;
    isGeneratingImage?: boolean;
    imageError?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isResponding]);


  useEffect(() => {
    const characterId = params.id as string;
    if (!characterId) {
        router.replace('/');
        return;
    }

    try {
      const storedCharacters = localStorage.getItem('characters');
      if (storedCharacters) {
        const characters: Character[] = JSON.parse(storedCharacters);
        const currentCharacter = characters.find(c => c.id === characterId);
        if(currentCharacter) {
            setCharacter(currentCharacter);
            const storedMessages = localStorage.getItem(`chatHistory_${characterId}`);
            if (storedMessages) {
                const parsedMessages = JSON.parse(storedMessages);
                if (Array.isArray(parsedMessages)) {
                    // Filter out any potential malformed messages from localStorage
                    setMessages(parsedMessages.filter(m => m && m.id));
                }
            } else {
                setMessages([{ id: `model-initial-${Date.now()}-${Math.random()}`, role: 'model', content: `Hello! I'm ${currentCharacter.name}. It's so nice to finally meet you. What's on your mind?`}]);
            }
        } else {
             toast({
                variant: 'destructive',
                title: 'Character not found.',
                description: 'The character you are trying to chat with does not exist.',
            });
            router.replace('/');
        }
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (character?.id && messages.length > 0) {
        // Don't save transient UI states to localStorage
        const messagesToStore = messages.map(({ isGeneratingImage, imageError, ...rest }) => rest);
        localStorage.setItem(`chatHistory_${character.id}`, JSON.stringify(messagesToStore));
    }
  }, [messages, character]);

  const generateImageForMessage = async (prompt: string, messageId: string, characterPersona: string) => {
    const imageResult = await generateChatImageAction({ prompt, characterPersona });

    if (imageResult.error) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isGeneratingImage: false, imageError: true } : m));
        toast({ title: "Image Generation Failed", description: imageResult.error, variant: "destructive" });
    } else {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isGeneratingImage: false, imageUrl: imageResult.imageDataUri, imageError: false } : m));
    }
  };

  const handleRegenerateImage = (prompt: string, messageId: string) => {
    if (!character) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isGeneratingImage: true, imageError: false, imageUrl: undefined } : m));
    generateImageForMessage(prompt, messageId, character.persona);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isResponding || !character) return;

      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: input,
      };

      const newMessagesHistory = [...messages, userMessage];
      setMessages(newMessagesHistory);
      setInput('');
      setIsResponding(true);

      const result = await chatAction({
          persona: character.persona,
          // Pass full history with the new user message for context
          history: newMessagesHistory.map(({id, ...rest}) => ({...rest, content: rest.content || ''})),
      });

      setIsResponding(false);

      if (result.error) {
          toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: result.error,
          });
          setMessages(prev => [...prev, { id: `model-error-${Date.now()}-${Math.random()}`, role: 'model', content: "Sorry, I'm having a little trouble thinking right now. Could you say that again?" }]);
      } else {
          const botMessage: Message = {
            id: `model-${Date.now()}-${Math.random()}`,
            role: 'model',
            content: result.message!,
          };

          if (result.imageRequest && result.imagePrompt) {
              botMessage.isGeneratingImage = true;
              botMessage.imagePrompt = result.imagePrompt;
              setMessages(prev => [...prev, botMessage]);
              generateImageForMessage(result.imagePrompt, botMessage.id, character.persona);
          } else {
              setMessages(prev => [...prev, botMessage]);
          }
      }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b bg-card p-4">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/">
                <ArrowLeft className="h-5 w-5"/>
                <span className="sr-only">Back to characters</span>
            </Link>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarImage src={character.avatarUrl} alt={character.name} />
          <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold font-headline">{character.name}</h2>
          <p className="text-sm text-muted-foreground">Your AI Companion</p>
        </div>
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
            <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                {message.role === 'model' && (
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={character.avatarUrl} alt={character.name} />
                        <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                 <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                    <div className="mt-2 space-y-2">
                        {message.isGeneratingImage && (
                            <div className="space-y-2">
                                <Skeleton className="h-48 w-full rounded-md" />
                                <p className="text-xs text-center text-muted-foreground animate-pulse">Generating image...</p>
                            </div>
                        )}
                        {message.imageUrl && !message.isGeneratingImage && (
                            <div className="group relative">
                                <Image src={message.imageUrl} alt="Generated image" width={400} height={400} className="rounded-lg max-w-full h-auto"/>
                                <Button 
                                    onClick={() => handleRegenerateImage(message.imagePrompt!, message.id)}
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <RefreshCw className="h-4 w-4"/>
                                    <span className="sr-only">Regenerate Image</span>
                                </Button>
                            </div>
                        )}
                        {message.imageError && !message.isGeneratingImage && (
                            <div className="mt-2 text-destructive-foreground bg-destructive/80 p-3 rounded-md flex flex-col items-center gap-2">
                                <AlertTriangle className="h-6 w-6"/>
                                <p className="text-sm font-semibold">Failed to generate image.</p>
                                <Button variant="ghost" size="sm" className="h-auto p-1 text-current underline" onClick={() => handleRegenerateImage(message.imagePrompt!, message.id)}>
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                 </div>
                {message.role === 'user' && (
                    <Avatar className="h-9 w-9 bg-muted">
                        <AvatarFallback><User className="h-5 w-5 text-muted-foreground"/></AvatarFallback>
                    </Avatar>
                )}
            </div>
        ))}
        {isResponding && (
            <div className="flex items-start gap-3">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={character.avatarUrl} alt={character.name} />
                    <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1.5 rounded-lg bg-muted p-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{animationDelay: '0s'}}></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{animationDelay: '0.2s'}}></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{animationDelay: '0.4s'}}></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <footer className="shrink-0 border-t bg-card p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <Input 
            placeholder="Type a message..." 
            className="pr-16"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isResponding}
            autoComplete="off"
            />
          <Button type="submit" size="icon" className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 bg-accent hover:bg-accent/80" disabled={isResponding || !input.trim()}>
            <Send className="h-4 w-4 text-accent-foreground" />
          </Button>
        </form>
         <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            Press <CornerDownLeft className="h-3 w-3" /> to send.
        </p>
      </footer>
    </div>
  );
}
