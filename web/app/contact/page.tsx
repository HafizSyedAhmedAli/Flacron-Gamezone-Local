"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Clock,
  MessageCircle,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Phone,
  Headphones,
} from "lucide-react";
import { Shell } from "@/components/layout";

type FormErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  general?: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error[name as keyof FormErrors]) {
      setError((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.subject || formData.subject.trim().length < 3) {
      errs.subject = "Subject must be at least 3 characters.";
    }

    if (!formData.message || formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters.";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess(false);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setError(errs);
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError({ general: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 mb-6 shadow-lg shadow-blue-500/50 relative group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <Mail className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Need help with Flacrom Gamezone? Our support team is here to assist
            you with any questions or issues.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div
          className={`grid md:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Email Support</h3>
              <p className="text-sm text-slate-400 mb-1">
                support@flacromgamezone.com
              </p>
              <p className="text-xs text-slate-500">General inquiries</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Phone</h3>
              <p className="text-sm text-slate-400 mb-1">+1 (555) 123-4567</p>
              <p className="text-xs text-slate-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-green-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Response Time</h3>
              <p className="text-sm text-slate-400 mb-1">Within 24 hours</p>
              <p className="text-xs text-slate-500">Premium: &lt;12 hours</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Premium Support</h3>
              <p className="text-sm text-slate-400 mb-1">24/7 Priority</p>
              <p className="text-xs text-slate-500">For premium members</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

              <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                  Send us a Message
                </h2>
                {/* Success Message */}
                {success && (
                  <div
                    className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl backdrop-blur-sm animate-slideIn"
                    role="alert"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>
                        Message sent successfully! We'll get back to you within
                        24 hours.
                      </span>
                    </div>
                  </div>
                )}
                {/* Error Message */}
                {error.general && (
                  <div
                    className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl backdrop-blur-sm animate-shake"
                    role="alert"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{error.general}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Name field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-300"
                      >
                        Your Name
                      </label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(error.name)}
                          aria-describedby={
                            error.name ? "name-error" : undefined
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600/50"
                        />
                      </div>
                      {error.name && (
                        <p
                          id="name-error"
                          className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                          role="alert"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {error.name}
                        </p>
                      )}
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-300"
                      >
                        Email Address
                      </label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          inputMode="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(error.email)}
                          aria-describedby={
                            error.email ? "email-error" : undefined
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600/50"
                        />
                      </div>
                      {error.email && (
                        <p
                          id="email-error"
                          className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                          role="alert"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {error.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Subject
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircle className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                      </div>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(error.subject)}
                        aria-describedby={
                          error.subject ? "subject-error" : undefined
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600/50"
                      />
                    </div>
                    {error.subject && (
                      <p
                        id="subject-error"
                        className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error.subject}
                      </p>
                    )}
                  </div>

                  {/* Message field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Message
                    </label>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your inquiry, issue, or feedback..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        aria-invalid={Boolean(error.message)}
                        aria-describedby={
                          error.message ? "message-error" : undefined
                        }
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none hover:border-slate-600/50"
                      />
                    </div>
                    {error.message && (
                      <p
                        id="message-error"
                        className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error.message}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full group/btn overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-transform duration-300 group-hover/btn:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>{" "}
              </div>
            </div>
          </div>

          {/* Additional Info Sidebar */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Office Hours */}
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Support Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Monday - Friday</span>
                  <span className="text-green-400">9AM - 6PM EST</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Saturday</span>
                  <span className="text-blue-400">10AM - 4PM EST</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sunday</span>
                  <span className="text-slate-500">Closed</span>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400">
                    Premium members get 24/7 priority support
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Headquarters
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Flacrom Gamezone Inc.
                <br />
                123 Gaming Boulevard
                <br />
                Suite 456
                <br />
                San Francisco, CA 94102
                <br />
                United States
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a
                  href="/faq"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  → FAQ & Help Center
                </a>
                <a
                  href="/terms"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  → Terms & Conditions
                </a>
                <a
                  href="/privacy"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  → Privacy Policy
                </a>
                <a
                  href="/pricing"
                  className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  → Pricing Plans
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div
          className={`mt-12 text-center transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-slate-500 text-sm">
            For urgent technical issues, please use our{" "}
            <a
              href="/support"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              live chat support
            </a>{" "}
            for immediate assistance
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </Shell>
  );
}
