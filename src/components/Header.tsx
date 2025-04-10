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
          <Link href="/about">
            <a className="nav-link">About</a>
          </Link>
          <Link href="/posts">
            <a className="nav-link">Posts</a>
          </Link>
          <Link href="/terms">
            <a className="nav-link">Terms</a>
          </Link>
          <Link href="/searchPage">
            <a className="nav-link">Search</a>
          </Link>
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
      <style jsx>{`
        .header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }
        .logo {
          width: 120px;
          height: auto;
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          text-decoration: none;
          color: inherit;
          padding: 5px 10px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .nav-link:hover {
          background-color: #f0f0f0;
        }
        .action-buttons a {
          text-decoration: none;
          margin-left: 15px;
          padding: 5px 10px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .action-buttons a:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </header>
  );
}
