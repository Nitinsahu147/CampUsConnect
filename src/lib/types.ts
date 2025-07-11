export type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  description: string;
  category: 'Workshop' | 'Seminar' | 'Hackathon' | 'Networking' | 'Tech Talk';
};
