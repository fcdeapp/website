import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav container mx-auto flex items-center justify-between">
        <Link href="/">
          <img src="/FacadeWebLogo.png" alt="Facade Logo" className="logo" />
        </Link>

        <div className="nav-links flex gap-8">
          <Link href="/about">About</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/terms">Terms</Link>
        </div>

        <div className="action-buttons flex gap-4">
          <Link href="/login">
            <a className="login-button">Login</a>
          </Link>
          <Link href="/signup">
            <a className="signup-button">Sign Up</a>
          </Link>
        </div>
      </nav>
    </header>
  );
}
