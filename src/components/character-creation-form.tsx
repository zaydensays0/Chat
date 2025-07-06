
'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateAvatarAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, User, Wand2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  backstory: z.string().min(10, { message: 'Backstory must be at least 10 characters.' }).max(1000),
  personality: z.string().min(10, { message: 'Personality must be at least 10 characters.' }).max(1000),
  dialogueStyle: z.string().min(10, { message: 'Dialogue style must be at least 10 characters.' }).max(1000),
  appearance: z.string().min(10, { message: 'Appearance description must be at least 10 characters.' }).max(1000),
});

type FormData = z.infer<typeof formSchema>;

interface Character {
    id: string;
    name: string;
    persona: string;
    avatarUrl: string;
}

export default function CharacterCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAvatarGenerating, startAvatarGeneration] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      backstory: '',
      personality: '',
      dialogueStyle: '',
      appearance: '',
    },
  });

  const handleGenerateAvatar = async () => {
    const appearance = form.getValues('appearance');
    if (!appearance || appearance.trim().length < 10) {
      form.setError('appearance', { type: 'manual', message: 'Please provide a detailed appearance description (at least 10 characters).' });
      return;
    }
    
    startAvatarGeneration(async () => {
      const result = await generateAvatarAction(appearance);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Avatar Generation Failed',
          description: result.error,
        });
      } else if (result.avatarDataUri) {
        setAvatarUrl(result.avatarDataUri);
        toast({
          title: 'Avatar Generated!',
          description: "Your character's avatar is ready.",
        });
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setAvatarUrl(dataUri);
        toast({
            title: 'Avatar Uploaded!',
            description: 'Your custom avatar has been set.',
        });
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = (data: FormData) => {
    const persona = `Name: ${data.name}\n\nBackstory: ${data.backstory}\n\nPersonality: ${data.personality}\n\nDialogue Style: ${data.dialogueStyle}\n\nAppearance for reference: ${data.appearance}`;
    
    const newCharacter: Character = {
      id: Date.now().toString(), // Simple unique ID
      name: data.name,
      persona,
      avatarUrl,
    };

    try {
        const storedCharacters = localStorage.getItem('characters');
        const characters: Character[] = storedCharacters ? JSON.parse(storedCharacters) : [];
        characters.push(newCharacter);
        localStorage.setItem('characters', JSON.stringify(characters));
        
        router.push(`/chat/${newCharacter.id}`);
    } catch (error) {
        console.error("Could not save to localStorage", error);
        toast({
            variant: "destructive",
            title: "Could not save character",
            description: "There was an error saving your character. Your browser might not support localStorage or it is full."
        })
    }
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Character Profile</CardTitle>
            <CardDescription>Fill in the details to bring your AI companion to life.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Luna" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="personality"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Personality</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Bubbly, curious, and a bit mischievous. Loves to talk about art and philosophy..." {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="dialogueStyle"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Dialogue Style</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Speaks in a casual, friendly tone, often using emojis and slang." {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="backstory"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Backstory</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., An artist from a small town who moved to the city to pursue her dreams..." {...field} rows={12} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium font-headline">Appearance & Avatar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="appearance"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>1. Appearance Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Long, wavy silver hair, bright emerald green eyes, and a sprinkle of freckles across her nose..." {...field} rows={5} />
                                </FormControl>
                                <FormDescription>Used for AI avatar generation.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="button" onClick={handleGenerateAvatar} disabled={isAvatarGenerating} className="w-full">
                            {isAvatarGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Avatar
                        </Button>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-muted"></div>
                            <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
                            <div className="flex-grow border-t border-muted"></div>
                        </div>
                        <div>
                            <FormLabel className="sr-only">2. Upload Custom Avatar</FormLabel>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload an Image
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-2">
                        <FormLabel>Avatar Preview</FormLabel>
                        <div className="relative w-48 h-48 rounded-lg bg-muted border flex items-center justify-center overflow-hidden">
                            {isAvatarGenerating ? (
                               <Skeleton className="h-full w-full" />
                            ) : avatarUrl ? (
                                <Image src={avatarUrl} alt="Generated Avatar" layout="fill" objectFit="cover" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <User className="h-10 w-10 mx-auto" />
                                    <p className="text-xs mt-2">Generate or upload an avatar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
              Create Character & Start Chatting
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
