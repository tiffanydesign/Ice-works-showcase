import "./globals.css";

export const metadata = {
  title: "Viscose",
  description:
    "A portfolio carousel rendered as a single WebGL shader. Cards ride a ring and stretch into threads as they pull apart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
