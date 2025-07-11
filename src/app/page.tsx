import { Header } from '@/components/header';
import { EventList } from '@/components/event-list';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <EventList />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CampUsConnect. All rights reserved.
      </footer>
    </div>
  );
}
