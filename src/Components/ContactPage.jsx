import { useState, useEffect, useRef } from "react";
import { countryDialCodes } from "../Data/countryDialCodes";
import SEO from "./SEO";
import { Send, Loader2, ChevronDown, Search, User, Mail, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(
    countryDialCodes.find((c) => c.code === "IN") || countryDialCodes[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmissionMessage(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredCountries = countryDialCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setSubmissionMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    const submissionData = {
      ...formData,
      phone: phoneDigits ? `${selectedCountry.dialCode}${phoneDigits}` : "",
    };

    setLoading(true);
    setSubmissionMessage(null);

    let result = { success: false };
    try {
      const response = await fetch(
        "https://us-central1-socialcrm-f9f58.cloudfunctions.net/submitContactForm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: submissionData.firstName,
            lastName: submissionData.lastName,
            email: submissionData.email,
            phone: submissionData.phone,
            subject: submissionData.subject,
            message: submissionData.message,
            websiteName: "The Agamas",
            websiteUrl: "https://theagamas.com",
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        result = { success: true, contactId: data.contactId };
      } else {
        result = { success: false, error: data.error || "Failed to process contact request" };
      }
    } catch (error) {
      result = { success: false, error: error.message || "Network error" };
    }
    setLoading(false);

    if (result.success) {
      setSubmissionMessage({
        type: "success",
        text: "Message sent successfully.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setSelectedCountry(countryDialCodes.find((c) => c.code === "IN") || countryDialCodes[0]);
    } else {
      setSubmissionMessage({
        type: "error",
        text: result.error || "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-10 md:pb-12">
      <SEO
        title="Contact Us - The Agamas"
        description="Get in touch with us for any inquiries about The Agamas translations, study groups, or feedback."
        name="The Agamas"
        type="website"
      />

      {/* ── HERO & CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[rgb(205,92,61)] font-bold font-sans text-[12px] leading-[16px] tracking-[0.6px] uppercase hover:opacity-80 transition-opacity mb-12 -ml-1"
        >
          <ArrowLeft size={14} strokeWidth={2.5} /> BACK TO HOME
        </Link>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-[52px] text-[#001e2d] font-normal leading-tight mb-6"
            style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}
          >
            Get in touch <span className="text-[rgb(205,92,61)] italic font-normal">with us.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-[#001e2d]/70 text-[24px] font-sans font-normal leading-relaxed text-center">
            Have questions about the translations? Want to join a study circle? <br className="hidden md:block" />
            We'd love to hear from you. Fill out the form below <br className="hidden md:block" />
            and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1">
          {/* 
          Contact Information Cards (Commented Out)
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#cd5c3d15] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#cd5c3d05] rounded-bl-full transition-all duration-500 group-hover:bg-[#cd5c3d08]" />

              <h3 className="text-xl font-semibold text-[#1e1e1e] mb-6 flex items-center gap-2">
                Contact Details
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#cd5c3d10] rounded-xl flex items-center justify-center text-[#cd5c3d]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#888] font-semibold mb-1">Email</p>
                    <a href="mailto:info@sifworld.com" className="text-[#1e1e1e] hover:text-[#cd5c3d] transition-colors font-medium">
                      info@sifworld.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#cd5c3d10] rounded-xl flex items-center justify-center text-[#cd5c3d]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#888] font-semibold mb-1">Phone</p>
                    <a href="tel:+1234567890" className="text-[#1e1e1e] hover:text-[#cd5c3d] transition-colors font-medium">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#cd5c3d10] rounded-xl flex items-center justify-center text-[#cd5c3d]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#888] font-semibold mb-1">Location</p>
                    <p className="text-[#1e1e1e] font-medium">
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-8 pt-8 border-t border-[#f0f0f0]">
                <div className="h-px flex-grow bg-gradient-to-r from-[#cd5c3d30] to-transparent" />
                <span className="text-[#cd5c3d] text-sm opacity-60">❧</span>
              </div>
            </div>

            <div className="bg-[#cd5c3d] p-8 rounded-2xl shadow-lg shadow-[#cd5c3d20] text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
              <h3 className="text-xl font-semibold mb-3">Study Groups</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Join our international community of practitioners and scholars studying the Agama scriptures.
              </p>
              <button className="text-sm font-bold bg-white text-[#cd5c3d] px-5 py-2 rounded-lg hover:bg-opacity-90 transition-all">
                Learn More
              </button>
            </div>
          </div>
          */}

          {/* Contact Form */}
          {/* Contact Form */}
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-2xl p-4 sm:p-6 md:p-10 rounded-[2rem] border bg-white border-amber-100 shadow-sm shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-xs font-medium text-slate-600">
                      First Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition bg-white border-slate-200 text-slate-900 focus:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-xs font-medium text-slate-600">
                      Last Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition bg-white border-slate-200 text-slate-900 focus:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-medium text-slate-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition bg-white border-slate-200 text-slate-900 focus:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-medium text-slate-600">
                      Phone Number
                    </label>
                    <div className="flex items-center rounded-xl border transition-all bg-white border-slate-200 focus-within:border-amber-500/50">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 px-3 py-2.5 outline-none transition h-full min-w-[100px] justify-between border-r border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                              alt={selectedCountry.name}
                              className="w-5 h-auto rounded-none"
                            />
                            <span className="text-sm font-medium text-slate-900">
                              {selectedCountry.dialCode}
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-slate-600 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-50 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-dropdown origin-top">
                            <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                              <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search country..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-amber-500/30 outline-none"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <button
                                    key={`${country.code}-${country.dialCode}`}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setIsDropdownOpen(false);
                                      setSearchQuery("");
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors ${selectedCountry.code === country.code ? "bg-amber-50 text-amber-700" : "text-slate-600"
                                      }`}
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <img
                                        src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                        alt={country.name}
                                        className="w-5 h-auto"
                                      />
                                      <span className="truncate">{country.name}</span>
                                    </div>
                                    <span className="text-slate-400 font-mono text-xs">{country.dialCode}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-slate-400 text-sm">No countries found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none transition text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-medium text-slate-600">
                    Subject
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition bg-white border-slate-200 text-slate-900 focus:border-amber-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-medium text-slate-600">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Your message here..."
                    className="w-full px-4 py-3 rounded-xl border outline-none transition resize-none bg-white border-slate-200 text-slate-900 focus:border-amber-500/50"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-900/10 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {submissionMessage && (
                  <p
                    className={`rounded-xl px-4 py-3 text-sm font-semibold text-center ${submissionMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    role="status"
                  >
                    {submissionMessage.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
