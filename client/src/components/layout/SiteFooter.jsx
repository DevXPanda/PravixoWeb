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
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6 lg:gap-8">
          {/* Brand Column (takes 2 cols on md+) */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-sunset shadow-md transition-transform duration-300 group-hover:scale-105">
                <span className="font-display text-lg font-bold text-white">
                  P
                </span>
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Pravixo
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground font-medium">
              Connecting creators and brands for meaningful, authentic
              collaborations.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-border/80 bg-background/80 p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:scale-110 shadow-xs"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="rounded-full border border-border/80 bg-background/80 p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:scale-110 shadow-xs"
              >
                <FaYoutube className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-border/80 bg-background/80 p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:scale-110 shadow-xs"
              >
                <FaFacebook className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-full border border-border/80 bg-background/80 p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:scale-110 shadow-xs"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
              Platform
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/browse"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Browse Creators
              </Link>

              <Link
                to="/browse?role=brand"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Featured Brands
              </Link>

              <Link
                to="/addons"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Addons
              </Link>

              <Link
                to="/referrals"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Referrals
              </Link>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
              Discover
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/reviews"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Reviews
              </Link>

              <Link
                to="/tips"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Creator Tips
              </Link>

              <Link
                to="/blog"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Guides & Articles
              </Link>

              <Link
                to="/collaborations"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Collaborations
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
              Company
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                About
              </Link>

              <Link
                to="/careers"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Careers
              </Link>

              <Link
                to="/blog"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Blog
              </Link>

              <Link
                to="/contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
              Support
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/help"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Help Center
              </Link>

              <Link
                to="/faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                FAQ
              </Link>

              <Link
                to="/privacy"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/protection-info"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-150 inline-block"
              >
                Protection Info
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">
            © {new Date().getFullYear()} Pravixo. All rights reserved.
          </p>

          <div className="flex gap-6 font-medium">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>

            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>

            <Link
              to="/contact"
              className="hover:text-primary transition-colors"
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