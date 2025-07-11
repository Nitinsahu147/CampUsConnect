'use client';

import { useState, useMemo, useEffect } from 'react';
import { events as staticEvents } from '@/lib/events';
import type { Event } from '@/lib/types';
import { EventCard } from './event-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { EventCardSkeleton } from './event-card-skeleton';

const categories = ['All', 'Workshop', 'Seminar', 'Hackathon', 'Networking', 'Tech Talk'];

export function EventList() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, orderBy("date", "asc"));
        const eventsSnapshot = await getDocs(q);
        const firestoreEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        const combinedEvents = [...staticEvents, ...firestoreEvents];
        setAllEvents(combinedEvents);

      } catch (error) {
        console.error("Error fetching events:", error);
        setAllEvents(staticEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter(event => new Date(event.date) >= new Date(new Date().setDate(new Date().getDate() -1)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              event.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
  }, [searchTerm, selectedCategory, allEvents]);

  return (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Find Your Next Tech Adventure</h1>
        <p className="text-muted-foreground">Explore workshops, seminars, and hackathons happening on campus.</p>
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events by keyword..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search events"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]" aria-label="Filter by category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-muted-foreground">No Events Found</h2>
          <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
