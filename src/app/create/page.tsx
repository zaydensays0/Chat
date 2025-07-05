
import CharacterCreationForm from '@/components/character-creation-form';

export default function CreateCharacterPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-24">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground sm:text-5xl">
            Create Your Soulmate
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Design your ideal virtual companion. Customize their personality, backstory, and even how they look.
          </p>
        </div>
        <CharacterCreationForm />
      </div>
    </main>
  );
}
