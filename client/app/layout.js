import './globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'The Fitness Garage – Gym & Yoga in Malviya Nagar, Jaipur',
  description:
    'Gym and yoga studio in Sector 3, Malviya Nagar, Jaipur. Supportive trainers, clean modern equipment. Rated 4.9★ on Google.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
