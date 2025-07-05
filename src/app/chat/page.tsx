
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page is a redirect handler.
// The main chat functionality is now at /chat/[id]
export default function ChatRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p>Redirecting...</p>
        </div>
    );
}
