"use client";

import Link from "next/link";
import { useState } from "react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        {/* Desktop */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">MalishaEdu</Link>

          <div className="flex gap-8 items-center">
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600">Services</button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded hidden group-hover:block">
                <Link href="/services/admission-service" className="block px-4 py-2 hover:bg-gray-100">Admission</Link>
                <Link href="/services/language-foundation" className="block px-4 py-2 hover:bg-gray-100">Language & Foundation</Link>
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600">About</button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded hidden group-hover:block">
                <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">Company Details</Link>
                <Link href="/team" className="block px-4 py-2 hover:bg-gray-100">Team</Link>
                <Link href="/gallery" className="block px-4 py-2 hover:bg-gray-100">Gallery</Link>
              </div>
            </div>

            <Link href="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>

            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>English</option>
              <option>中文</option>
              <option>বাংলা</option>
            </select>

            <Link href="/get-free-consultation" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Get Consultation
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">MalishaEdu</Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-4 mt-4">
            <Link href="/universities" className="text-gray-700 hover:text-blue-600">Universities</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
            <Link href="/scholarships" className="text-gray-700 hover:text-blue-600">Scholarships</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
