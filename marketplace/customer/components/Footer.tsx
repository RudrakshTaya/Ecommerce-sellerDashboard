import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-earth-900 text-earth-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-craft-500 to-earth-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="text-xl font-bold text-white">
                Handmade Crafts
              </span>
            </div>
            <p className="text-earth-300 text-sm leading-relaxed">
              Discover unique, handmade treasures from talented artisans around the world. 
              Every purchase supports creativity and craftsmanship.
            </p>
            <div className="flex items-center space-x-2 text-craft-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Made with love for crafters</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Home
              </Link>
              <Link to="/products" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                All Products
              </Link>
              <Link to="/categories" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Categories
              </Link>
              <Link to="/sellers" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Our Sellers
              </Link>
              <Link to="/about" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Support</h3>
            <div className="space-y-2">
              <Link to="/help" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Help Center
              </Link>
              <Link to="/shipping" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Returns & Exchanges
              </Link>
              <Link to="/contact" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                Contact Us
              </Link>
              <Link to="/faq" className="block text-earth-300 hover:text-craft-400 text-sm transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-earth-300">
                <Mail className="w-4 h-4 text-craft-400" />
                <span className="text-sm">support@handmadecrafts.com</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-300">
                <Phone className="w-4 h-4 text-craft-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-300">
                <MapPin className="w-4 h-4 text-craft-400" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-white mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-8 h-8 bg-earth-800 rounded-lg flex items-center justify-center text-earth-300 hover:text-craft-400 hover:bg-earth-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-earth-800 rounded-lg flex items-center justify-center text-earth-300 hover:text-craft-400 hover:bg-earth-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-earth-800 rounded-lg flex items-center justify-center text-earth-300 hover:text-craft-400 hover:bg-earth-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-earth-800 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-earth-300 text-sm mb-4">
              Get the latest news about new collections and special offers
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-earth-800 border border-earth-700 rounded-lg text-white placeholder-earth-400 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-craft-600 hover:bg-craft-700 text-white rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-earth-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-earth-400 text-sm">
            © 2024 Handmade Crafts. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-earth-400 hover:text-craft-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-earth-400 hover:text-craft-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-earth-400 hover:text-craft-400 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
