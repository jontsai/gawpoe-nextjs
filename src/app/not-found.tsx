import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>Page not found</h1>
      <p>
        <Link href="/">Return to Gaw | Poe LLP</Link>
      </p>
    </main>
  );
}
