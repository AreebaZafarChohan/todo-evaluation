// T034: Footer component with links and copyright
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: <FiGithub /> },
    { name: 'Twitter', href: '#', icon: <FiTwitter /> },
    { name: 'Email', href: '#', icon: <FiMail /> },
  ];

  return (
    <footer className={cn('border-t border-[var(--card-border)] bg-[var(--card-bg)] py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center">
                <FiMail className="text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">TodoApp</span>
            </div>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              A beautiful, modern todo application with stunning UI and smooth animations.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.slice(0, 4).map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.slice(4).map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/docs" 
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Connect</h3>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              Subscribe to our newsletter for updates.
            </p>
            <form className="mt-2 flex">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 rounded-l-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
              />
              <button
                type="submit"
                className="bg-[var(--primary-500)] text-white px-4 py-2 rounded-r-lg hover:bg-[var(--primary-600)] transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--card-border)] flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            &copy; {currentYear} TodoApp. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-1 text-sm text-[var(--muted-foreground)]">
            Made with <FiHeart className="mx-1 text-[var(--error)]" /> by developers who care
          </div>
        </div>
      </div>
    </footer>
  );
}