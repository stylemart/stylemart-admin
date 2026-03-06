// ============================================================
// ROOT LAYOUT
// Wraps the entire admin panel application
// ============================================================

import "./globals.css";

export const metadata = {
  title: "StyleMart Admin Panel",
  description: "Admin dashboard for StyleMart e-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
