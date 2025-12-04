import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaXTwitter, FaGithub, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
  const navigationLinks = [
    { name: 'About', to: '/about' },
    { name: 'Blog', to: '/blog' },
    { name: 'Jobs', to: '/jobs' },
    { name: 'Press', to: '/press' },
    { name: 'Accessibility', to: '/accessibility' },
    { name: 'Partners', to: '/partners' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaXTwitter, href: 'https://x.com', label: 'X (Twitter)' },
    { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 py-12 sm:py-16 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Navigation Links Row */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Social Media Icons Row */}
        <div className="flex justify-center gap-6 mb-8">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>

        {/* Copyright Row */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            © 2025 Gate City Gigs, Inc. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

