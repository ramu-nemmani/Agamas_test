import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import logo from "../assets/favicon.webp";

function Footer() {
  const navigate = useNavigate();
  const [currentVersion, setCurrentVersion] = useState("v1.0.0");

  useEffect(() => {
    fetch("/version-history.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCurrentVersion(data[0].version);
        }
      })
      .catch(() => setCurrentVersion("v1.0.0"));
  }, []);

  const handleVersionClick = () => {
    navigate("/version-history");
  };

  return (
    <footer className="bg-[#0a0a0a] text-[#cbd5e1] border-t border-white/10" id="quick-links">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col gap-10 lg:flex-row lg:justify-between">
          
          {/* Column 1: Brand & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                alt="The Agamas Logo"
              />
              <span className="text-[30px] leading-[36px] font-normal font-agamas-title">
                <span className="text-[#cbd5e1]">The </span>
                <span className="text-[#cd5c3d] font-normal">Agamas</span>
              </span>
            </div>
            
            <p className="border-l-2 border-[#cd5c3d]/40 pl-3 text-sm italic leading-relaxed text-[#94a3b8] max-w-sm">
              "Ancient wisdom faithfully translated — free for all to read, study, and share."
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cd5c3d]" />
              <span className="text-[10px] text-[#cd5c3d] tracking-widest uppercase font-semibold">
                Open & Free Access
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/sunyatee/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-[#94a3b8] hover:text-[#cd5c3d] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/dxnsunya"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-[#94a3b8] hover:text-[#cd5c3d] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@sunyastudios"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-[#94a3b8] hover:text-[#cd5c3d] transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/sunyatee/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-[#94a3b8] hover:text-[#cd5c3d] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex gap-16 lg:justify-end">
            {/* Column 2: Quick Links */}
            <div>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#cd5c3d]">
                Quick Links
              </div>
              <ul className="space-y-3 text-sm font-light text-[#94a3b8]">
                <li>
                  <Link to="/" className="transition-colors hover:text-[#cd5c3d]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="transition-colors hover:text-[#cd5c3d]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="transition-colors hover:text-[#cd5c3d]">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="/#testimonials" className="transition-colors hover:text-[#cd5c3d]">
                    Testimonial
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Explore */}
            <div>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#cd5c3d]">
                Explore
              </div>
              <ul className="space-y-3 text-sm font-light text-[#94a3b8]">
                <li>
                  <Link to="/#chapters" className="transition-colors hover:text-[#cd5c3d]">Reading Room</Link>
                </li>
                <li>
                  <a
                    href="https://www.sifworld.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-[#cd5c3d]"
                  >
                    SIF Website
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs sm:flex-row text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <span>© 2026 The Agamas. All rights reserved.</span>
            <button
              onClick={handleVersionClick}
              className="rounded-full border border-[#334155] bg-[#1e293b] px-3 py-1 text-xs text-[#cd5c3d]/80 transition-colors hover:text-[#cd5c3d]"
            >
              {currentVersion}
            </button>
          </div>
          
          <div className="flex items-center">
            <span>Developed by <span className="font-medium text-[#cbd5e1]">Sunyatee International Foundation</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
