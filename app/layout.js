import "./globals.css";
import "./theme.css";


export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "In The Pitts Disc Golf",
  description: "In The Pitts Disc Golf Course",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
