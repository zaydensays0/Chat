
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: string;
  name: string;
  persona: string;
  avatarUrl: string;
}

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

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

  const handleDeleteClick = (e: React.MouseEvent, character: Character) => {
    e.stopPropagation();
    setCharacterToDelete(character);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!characterToDelete) return;

    try {
        const updatedCharacters = characters.filter(c => c.id !== characterToDelete.id);
        setCharacters(updatedCharacters);
        
        localStorage.setItem('characters', JSON.stringify(updatedCharacters));
        localStorage.removeItem(`chatHistory_${characterToDelete.id}`);

        toast({
            title: 'Character Deleted',
            description: `'${characterToDelete.name}' has been successfully deleted.`,
        });
    } catch (error) {
        console.error("Failed to delete character:", error);
        toast({
            variant: "destructive",
            title: "Deletion failed",
            description: "Could not delete the character. Please try again."
        });
    } finally {
        setIsDeleteDialogOpen(false);
        setCharacterToDelete(null);
    }
  };


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
              <Card key={character.id} className="overflow-hidden hover:shadow-lg transition-shadow group relative">
                <div className="absolute top-2 right-2 z-10">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={(e) => handleDeleteClick(e, character)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Character</span>
                    </Button>
                </div>
                <div className="cursor-pointer" onClick={() => router.push(`/chat/${character.id}`)}>
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
                </div>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your character
                '{characterToDelete?.name}' and remove all associated chat history.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
