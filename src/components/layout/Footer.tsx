import Link from "next/link";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export function Footer() {
  return (
    <footer className="bg-rift-surface border-t border-rift-mist/10 mt-auto">
      <NewsletterSection compact />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
        <div className="sm:col-span-2 md:col-span-2">
          <h3 className="text-lg font-bold tracking-[0.2em] mb-4 text-rift-mist">{BRAND.name}</h3>
          <p className="text-sm text-rift-mist/60 max-w-sm leading-relaxed">
            {BRAND.description}
          </p>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-6">Shop</h4>
          <ul className="space-y-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="text-sm text-rift-mist/70 hover:text-rift-orange transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-6">Info</h4>
          <ul className="space-y-3">
            {[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/shop", label: "Shop All" },
              { href: "/terms", label: "Terms & Conditions" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-rift-mist/70 hover:text-rift-orange transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-rift-mist/10 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs text-rift-mist/40 tracking-wider">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { name: "Instagram", href: "https://www.instagram.com/riftdistrict?igsh=MnBjbnh4dHk2cmt3" },
              { name: "Facebook", href: "https://www.facebook.com/riftdistrict" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rift-mist/40 hover:text-rift-orange tracking-wider uppercase transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
