import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        {/* Left: Logo */}
        <Link href="/">
          <img src="/FacadeWebLogo.png" alt="Facade Logo" className="logo" />
        </Link>

        {/* Center: Nav Links */}
        <div className="nav-links">
          <Link href="/about">About</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/terms">Terms</Link>
        </div>

        {/* Right: Action Buttons */}
        <div className="action-buttons">
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
