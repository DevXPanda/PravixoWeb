import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-sunset">
                <span className="font-display text-lg font-bold text-white">
                  P
                </span>
              </div>

              <span className="font-display text-xl font-bold">
                Pravixo
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Connecting creators and brands for meaningful,
              authentic collaborations.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-border p-2 hover:bg-accent"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="rounded-full border border-border p-2 hover:bg-accent"
              >
                <FaYoutube className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-border p-2 hover:bg-accent"
              >
                <FaFacebook className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-full border border-border p-2 hover:bg-accent"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-display text-sm font-semibold">
              Platform
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/browse"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Browse Creators
              </Link>

              <Link
                to="/addons"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Addons
              </Link>

              <Link
                to="/reviews"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reviews
              </Link>

              <Link
                to="/tips"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tips
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-sm font-semibold">
              Company
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>

              <Link
                to="/careers"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Careers
              </Link>

              <Link
                to="/blog"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Blog
              </Link>

              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-sm font-semibold">
              Support
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/help"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Help Center
              </Link>

              <Link
                to="/faq"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>

              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/protection-info"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Protection Info
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Pravixo. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              to="/terms"
              className="hover:text-foreground"
            >
              Terms
            </Link>

            <Link
              to="/privacy"
              className="hover:text-foreground"
            >
              Privacy
            </Link>

            <Link
              to="/contact"
              className="hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;