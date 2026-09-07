import "./globals.css";

export const metadata = {
  title: "Viscose",
  description:
    "A portfolio carousel rendered as a single WebGL shader. Cards ride a ring and stretch into threads as they pull apart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* helvetica-neue-lt-pro, the same Adobe kit the storefront this piece
            is embedded in already loads — so the iframe and its host set in one
            typeface rather than two. In the document rather than in globals.css
            because Tailwind's build drops a remote @import it cannot resolve;
            see the note there. */}
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/omf6kcr.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
