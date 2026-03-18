import './globals.css';
import Provider from './provider';

export const metadata = {
  title: 'SkyBooker | Flight Booking',
  description: 'End-to-end flight booking with route discovery, TanStack Query data fetching, and interactive seat selection.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 font-sans antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
