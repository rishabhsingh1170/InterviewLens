import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import interview from "../assets/interviewLens.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-to-use", label: "How to Use" },
    { href: "#about", label: "About" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-16 bg-[#07070f]/70 backdrop-blur-xl border-b border-purple-500/20">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-[2px] rounded-[10px]">
            <div className="flex items-center justify-center overflow-hidden">
              <img
                src={interview}
                alt="InterviewLens Logo"
                className="logo object-contain"
              />
            </div>
          </div>
        </Link>

        {/* ── Desktop nav links (hide when logged in) ── */}
        <div className="desktop-nav">
          {!user &&
            navLinks.map(({ href, label }) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
        </div>

        {/* ── Desktop auth / profile ── */}
        <div className="desktop-nav">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-white nav-link"
                style={{ textDecoration: "none" }}
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:-translate-y-px"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center w-[15vw]">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-[40%] text-center py-4 py-3 rounded-xl text-[15px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                    boxShadow: "0 2px 16px rgba(139,92,246,0.30)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          className="hamburger"
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              borderRadius: "2px",
              backgroundColor: "white",
              transformOrigin: "center",
              transition: "transform 0.3s, opacity 0.3s",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              borderRadius: "2px",
              backgroundColor: "white",
              transition: "transform 0.3s, opacity 0.3s",
              opacity: menuOpen ? 0 : 1,
              transform: menuOpen ? "scaleX(0)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              borderRadius: "2px",
              backgroundColor: "white",
              transformOrigin: "center",
              transition: "transform 0.3s, opacity 0.3s",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`
          fixed top-15 left-0 right-0 z-40 w-full
          flex flex-col md:hidden
          px-5 pb-5 pt-2 gap-1
          border-b border-purple-500/15
          backdrop-blur-xl
          transition-all duration-300
          ${
            menuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
        style={{ background: "rgba(10,9,22,0.96)" }}
      >
        {!user &&
          navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center px-3.5 py-3 rounded-xl text-[15px] font-medium text-purple-200/65 no-underline transition-all duration-200 hover:text-white hover:bg-purple-500/15"
            >
              {label}
            </a>
          ))}

        <div className="h-px bg-purple-500/15 my-2" />

        {user ? (
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-3 rounded-xl text-[15px] font-medium text-purple-200/70 border border-purple-500/20 bg-purple-500/8 no-underline transition-all duration-200 hover:text-white hover:bg-purple-500/18"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl text-[15px] font-medium text-purple-200/70 border border-purple-500/20 bg-purple-500/8 cursor-pointer transition-all duration-200 hover:text-white hover:bg-purple-500/18"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-3 rounded-xl text-[15px] font-medium text-purple-200/70 border border-purple-500/20 bg-purple-500/8 no-underline transition-all duration-200 hover:text-white hover:bg-purple-500/18"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-3 rounded-xl text-[15px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                boxShadow: "0 2px 16px rgba(139,92,246,0.30)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Sign up free
            </Link>
          </div>
        )}
      </div>

      {/* keyframe for nav entry */}
      <style>{`@keyframes navIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </>
  );
}
