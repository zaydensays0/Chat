"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, CornerDownLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Character {
  name: string;
  persona: string;
  avatarUrl: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const characterData = sessionStorage.getItem('character');
      if (characterData) {
        setCharacter(JSON.parse(characterData));
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Failed to parse character data from sessionStorage', error);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
      <header className="flex items-center gap-4 border-b bg-card p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={character.avatarUrl} alt={character.name} />
          <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold font-headline">{character.name}</h2>
          <p className="text-sm text-muted-foreground">Your AI Companion</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chat messages will go here */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
             <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.persona}</p>
             <p className="text-xs text-center pt-4 text-muted-foreground/50">This is your character's persona. The chat functionality will be implemented in a future step.</p>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t bg-card p-4">
        <div className="relative">
          <Input placeholder="Type a message..." className="pr-16" />
          <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-accent hover:bg-accent/80">
            <Send className="h-4 w-4 text-accent-foreground" />
          </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 justify-center">
            Press <CornerDownLeft className="h-3 w-3" /> to send.
        </p>
      </footer>
    </div>
  );
}
