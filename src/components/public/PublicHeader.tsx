"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Globe } from "lucide-react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-brand-100 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-brand-800 hover:text-brand-900 transition-colors">
            MalishaEdu
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 items-center">
            {/* Universities */}
            <Link href="/universities" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">
              Universities
            </Link>

            {/* Courses */}
            <Link href="/courses" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">
              Courses
            </Link>

            {/* Scholarships */}
            <Link href="/scholarships" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">
              Scholarships
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors flex items-center gap-1 group">
                Services
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white shadow-card rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 group-hover:translate-y-1">
                <Link href="/services" className="block px-4 py-2.5 hover:bg-brand-50 text-gray-700 first:rounded-t">Services</Link>
              </div>
            </div>

            {/* About Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors flex items-center gap-1 group">
                About
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white shadow-card rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 group-hover:translate-y-1">
                <Link href="/about" className="block px-4 py-2.5 hover:bg-brand-50 text-gray-700 first:rounded-t">Company Details</Link>
                <Link href="/team" className="block px-4 py-2.5 hover:bg-brand-50 text-gray-700">Team</Link>
                <Link href="/gallery" className="block px-4 py-2.5 hover:bg-brand-50 text-gray-700 last:rounded-b">Gallery</Link>
              </div>
            </div>

            {/* Blog */}
            <Link href="/blog" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">
              Blog
            </Link>

            {/* Contact */}
            <Link href="/contact" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">
              Contact
            </Link>

            {/* Language Selector */}
            <div className="flex items-center ml-4 pl-4 border-l border-brand-100">
              <Globe size={16} className="text-gray-700 mr-2" />
              <select className="text-sm text-gray-700 bg-transparent border-0 focus:outline-none cursor-pointer">
                <option>English</option>
                <option>中文</option>
                <option>বাংলা</option>
              </select>
            </div>

            {/* CTA Button */}
            <Link href="/get-free-consultation" className="ml-4 px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-800 text-white rounded-lg hover:from-brand-800 hover:to-brand-900 transition-all duration-200 hover:shadow-card font-medium">
              Get Consultation
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-brand-50 rounded transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-brand-800" /> : <Menu size={24} className="text-brand-800" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            <Link href="/universities" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Universities</Link>
            <Link href="/courses" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Courses</Link>
            <Link href="/scholarships" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Scholarships</Link>
            <Link href="/services" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Services</Link>
            <Link href="/about" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">About</Link>
            <Link href="/blog" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Blog</Link>
            <Link href="/contact" className="px-3 py-2 text-gray-700 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors">Contact</Link>
            <Link href="/get-free-consultation" className="px-3 py-2 bg-gradient-to-r from-brand-700 to-brand-800 text-white rounded-lg text-center font-medium">Get Consultation</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
