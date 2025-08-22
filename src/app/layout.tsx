import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "JSON-PWIN",
  description: "Fast JSON preview",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-10xl p-4">
          <Link href={"/"}>Home</Link>

          {children}
        </div>
      </body>
    </html>
  );
}
