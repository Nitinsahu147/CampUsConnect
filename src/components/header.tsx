'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Chatbot } from './chatbot';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();


  const handleLogout = async () => {
    try {
        await auth.signOut();
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/');
    } catch (error) {
        toast({
            title: 'Logout Failed',
            description: 'Something went wrong. Please try again.',
            variant: 'destructive'
        })
    }
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary font-headline">
          CampUsConnect
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Button asChild variant="ghost" className="text-sm sm:text-base">
                <Link href="/submit-event">Submit Event</Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="text-sm sm:text-base">
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/login">Admin Login</Link>
            </Button>
          )}
          <Chatbot />
        </nav>
      </div>
    </header>
  );
}
