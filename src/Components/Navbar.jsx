import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/favicon.webp";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { ChevronDown } from "lucide-react";

function MobileDropdown({ link, isActive, handleHashLinkClick, setMenuOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#5F6F87] hover:bg-slate-200/40 hover:text-[#111B33] rounded-lg transition"
      >
        {link.label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 mt-1 pl-4">
          {link.dropdown.map((subItem) => (
            <Link
              key={subItem.to}
              to={subItem.to}
              onClick={subItem.to.startsWith("/#") ? (e) => {
                setMenuOpen(false);
                e.preventDefault();
                handleHashLinkClick(subItem.to);
              } : () => setMenuOpen(false)}
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive(subItem.to) ? "text-[#111B33] bg-slate-200/40" : "text-[#5F6F87] hover:bg-slate-200/40 hover:text-[#111B33]"
              }`}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Reading Room", to: "/#chapters" },
    { label: "Videos", to: "/video" },
    { label: "Features", to: "/features" },
    { 
      label: "About", 
      dropdown: [
        { label: "About Us", to: "/about-us" },
        { label: "Vision & Mission", to: "/#vision-mission" },
        { label: "Leadership", to: "/#leadership" }
      ] 
    },
    { label: "Contact Us", to: "/contact-us" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" && location.hash !== "#chapters";
    }
    return location.pathname.startsWith(path);
  };

  const handleHashLinkClick = (path) => {
    if (location.pathname === "/") {
      const sectionId = path.substring(2); // strip "/#"
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.location.hash = sectionId;
    } else {
      navigate({ pathname: "/", hash: path.substring(1) });
    }
  };

  return (
    <header className="sticky top-0 z-[60] transition-all duration-300 border-b border-[#E5DEC9]/60 bg-[#f3ede5] shadow-sm py-3">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer -ml-1">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <img
              src={logo}
              className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
              alt="The Agamas Logo"
            />
            <span className="relative inline-block text-[30px] leading-[36px] font-normal font-agamas-title">
              <span className="text-[#1e1e1e]">The </span>
              <span className="text-[#cd5c3d] font-normal">Agamas</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.label} className="relative group">
                  <button
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium font-serif-display transition-all duration-150 flex items-center gap-1 ${
                      link.dropdown.some(d => isActive(d.to))
                        ? "text-[#cd5c3d]"
                        : "text-black hover:text-[#cd5c3d]"
                    }`}
                  >
                    {link.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="w-48 bg-[#f3ede5]/95 backdrop-blur border border-[#E9E4DA] rounded-xl shadow-lg py-2 flex flex-col">
                      {link.dropdown.map((subItem) => (
                        <Link
                          key={subItem.to}
                          to={subItem.to}
                          onClick={subItem.to.startsWith("/#") ? (e) => {
                            e.preventDefault();
                            handleHashLinkClick(subItem.to);
                          } : undefined}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            isActive(subItem.to)
                              ? "text-[#cd5c3d] bg-white/50"
                              : "text-black hover:text-[#cd5c3d] hover:bg-white/50"
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={link.to.startsWith("/#") ? (e) => {
                    e.preventDefault();
                    handleHashLinkClick(link.to);
                  } : undefined}
                  className={`px-4 py-2.5 ${link.label === "Reading Room" ? "rounded-full" : "rounded-lg"} text-sm font-medium font-serif-display transition-all duration-150 ${
                    link.label === "Reading Room" 
                      ? "bg-[#cd5c3d] text-white hover:bg-[#b8503a] shadow-sm"
                      : (link.to === "/#chapters" && location.pathname === "/" && location.hash === "#chapters") || (link.to !== "/#chapters" && isActive(link.to))
                        ? "text-[#cd5c3d]"
                        : "text-black hover:text-[#cd5c3d]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* User / Auth */}
          <div className="relative group flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-[#cd5c3d] hover:bg-amber-200 focus:outline-none transition-colors font-medium text-lg uppercase overflow-hidden ml-2"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name || "Profile"} className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {user.name ? user.name.charAt(0) : user.email?.charAt(0) || "?"}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#f3ede5]/95 backdrop-blur border border-[#E9E4DA] rounded-xl shadow-lg flex flex-col py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-3 border-b border-[#E9E4DA] mb-1 hover:bg-[#cd5c3d]/10 transition"
                    >
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.name || "Reader"}
                      </p>
                      <p className="text-xs text-[#5D554D] truncate mt-0.5">
                        {user.email}
                      </p>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition"
                    >
                      Log Out
                    </button>
                  </div>
                )}

                {/* Overlay to close dropdown when clicking outside */}
                {profileDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition ml-2"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#111B33] p-1.5 hover:bg-slate-200/40 rounded-lg transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <>
          <div 
            className="md:hidden absolute top-full left-0 right-0 h-[100vh] z-20 bg-black/10 backdrop-blur-sm" 
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="md:hidden absolute left-0 right-0 top-full border-b border-[#E9E4DA] bg-[#FFFFFF] shadow-lg z-30">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                link.dropdown ? (
                  <MobileDropdown 
                    key={link.label} 
                    link={link} 
                    isActive={isActive} 
                    handleHashLinkClick={handleHashLinkClick} 
                    setMenuOpen={setMenuOpen}
                  />
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={link.to.startsWith("/#") ? (e) => {
                      setMenuOpen(false);
                      e.preventDefault();
                      handleHashLinkClick(link.to);
                    } : () => setMenuOpen(false)}
                    className={`block px-4 py-2.5 text-sm font-medium ${link.label === "Reading Room" ? "rounded-full text-center mt-2 mb-1" : "rounded-lg"} transition ${
                      link.label === "Reading Room"
                        ? "bg-[#cd5c3d] text-white shadow-sm"
                        : (link.to === "/#chapters" && location.pathname === "/" && location.hash === "#chapters") || (link.to !== "/#chapters" && isActive(link.to))
                          ? "text-[#111B33] bg-slate-200/40"
                          : "text-[#5F6F87] hover:bg-slate-200/40 hover:text-[#111B33]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>
          </div>
        </>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </header>
  );
}

export default Navbar;
