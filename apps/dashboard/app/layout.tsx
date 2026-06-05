import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIMate POS",
  description: "Enterprise AI voice ordering control center"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
