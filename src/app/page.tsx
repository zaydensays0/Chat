
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Character {
  id: string;
  name: string;
  persona: string;
  avatarUrl: string;
}

export default function Home() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCharacters = localStorage.getItem('characters');
      if (storedCharacters) {
        setCharacters(JSON.parse(storedCharacters));
      }
    } catch (error) {
      console.error("Failed to parse characters from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center p-4 lg:p-24">
        <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-12 w-80" />
                <Skeleton className="h-12 w-56" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-lg" />
                ))}
            </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-4 lg:p-24">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground sm:text-5xl">
            Your Soulmates
          </h1>
          <Button size="lg" onClick={() => router.push('/create')}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Character
          </Button>
        </div>

        {characters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characters.map((character) => (
              <Card key={character.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => router.push(`/chat/${character.id}`)}>
                <div className="relative h-48 w-full">
                    <Image
                      src={character.avatarUrl || 'https://placehold.co/400x400.png'}
                      alt={character.name}
                      layout="fill"
                      objectFit="cover"
                      className={`transition-transform duration-300 group-hover:scale-105 ${!character.avatarUrl ? 'grayscale' : ''}`}
                      data-ai-hint="profile portrait"
                    />
                </div>
                <CardHeader>
                  <CardTitle>{character.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        Chat Now
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold text-muted-foreground">No Soulmates Yet</h2>
            <p className="mt-2 text-muted-foreground">Click the button above to create your first AI companion.</p>
          </div>
        )}
      </div>
    </main>
  );
}
