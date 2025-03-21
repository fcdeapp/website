import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav container mx-auto flex items-center justify-between">
        <Link href="/">
          <img src="/FacadeWebLogo.png" alt="Facade Logo" className="logo" />
        </Link>
        <div className="nav-links flex gap-6">
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </nav>
    </header>
  );
}
