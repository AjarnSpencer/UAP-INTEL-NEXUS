
const GENERIC_PLACEHOLDERS: string[] = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop', // Newspapers
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Globe/Network
  'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1974&auto=format&fit=crop', // Microphones/Press
  'https://images.unsplash.com/photo-1554224155-16954405a255?q=80&w=2070&auto=format&fit=crop', // Finance/Charts
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=2070&auto=format&fit=crop', // Journalism/Desk
];

export const getRandomPlaceholder = (): string => {
  return GENERIC_PLACEHOLDERS[Math.floor(Math.random() * GENERIC_PLACEHOLDERS.length)];
};
