'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { RegisterEventDialog } from './register-event-dialog';

interface EventCardProps {
  event: Event;
}

function createGoogleCalendarLink(event: Event): string {
  const startTime = new Date(`${event.date}T${event.time}:00`);
  // Assuming 2 hour duration for all events for simplicity
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', event.title);
  url.searchParams.append('dates', `${formatDate(startTime)}/${formatDate(endTime)}`);
  url.searchParams.append('details', event.description);
  url.searchParams.append('location', event.location);

  return url.toString();
}

export function EventCard({ event }: EventCardProps) {
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This logic is deferred to run only on the client side to prevent hydration mismatch
    // due to timezone differences between server and client.
    setFormattedDate(format(new Date(`${event.date}T00:00:00`), 'EEEE, MMMM d, yyyy'));
    setCalendarLink(createGoogleCalendarLink(event));
  }, [event]);

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-bold font-headline">{event.title}</CardTitle>
          <Badge className="bg-primary/10 text-primary shrink-0">{event.category}</Badge>
        </div>
        <CardDescription className="pt-2 line-clamp-3">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 shrink-0" />
          {formattedDate ? <span>{formattedDate}</span> : <span className="h-5 w-40 rounded-md bg-muted animate-pulse" />}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2 shrink-0" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 shrink-0" />
          <span>{event.location}</span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        {calendarLink ? (
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent-foreground">
            <a href={calendarLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Calendar
            </a>
          </Button>
        ) : (
          <Button className="w-full bg-accent text-accent-foreground" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </Button>
        )}
        <RegisterEventDialog eventId={event.id} />
      </CardFooter>
    </Card>
  );
}
