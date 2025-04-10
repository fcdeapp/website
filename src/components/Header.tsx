import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        {/* Left: Logo */}
        <Link href="/">
          <img
            src="/FacadeWebLogo.png"
            alt="Facade Logo"
            className="logo"
          />
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
          width: 40px; /* 로고 크기를 줄임 */
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
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: bold;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .action-buttons a:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        /* 로그인 버튼: 깔끔한 다크 테마 */
        .login-button {
          background-color: #0a1045;
          color: #fff;
          border: 1px solid #0a1045;
        }
        .login-button:hover {
          background-color: #0a1045;
          opacity: 0.9;
        }
        /* 회원가입 버튼: 하얀색 배경에 다크 테마 글자 및 테두리 */
        .signup-button {
          background-color: #fff;
          color: #0a1045;
          border: 1px solid #0a1045;
        }
        .signup-button:hover {
          background-color: #f7f7f7;
        }
      `}</style>
    </header>
  );
}
