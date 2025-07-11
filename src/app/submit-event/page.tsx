'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/header';
import { SubmitEventForm } from '@/components/submit-event-form';

export default function SubmitEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // AuthProvider shows a global loader on initial load.
    // This return prevents a flash of content before redirect.
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Submit a New Event</h1>
            <p className="text-muted-foreground mb-6">Fill out the form below to add a new tech event to our listings.</p>
            <SubmitEventForm />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CampUsConnect. All rights reserved.
      </footer>
    </div>
  );
}
