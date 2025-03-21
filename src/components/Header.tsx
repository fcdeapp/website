import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav container mx-auto flex items-center justify-between">
        <Link href="/">
          <img src="/FacadeWebLogo.png" alt="Facade Logo" className="h-8 w-auto" />
        </Link>
        <div className="nav-links flex gap-6">
          <Link href="/about"><a>About</a></Link>
          <Link href="/features"><a>Features</a></Link>
          <Link href="/terms"><a>Terms</a></Link>
        </div>
      </nav>
    </header>
  );
}
