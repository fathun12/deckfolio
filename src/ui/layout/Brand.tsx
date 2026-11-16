import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="font-display text-lg font-semibold">
      <span className="mr-2 inline-block h-2 w-2 bg-accent" />
      Deckfolio
    </Link>
  );
}