import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

const staticPages: Record<string, { title: string; content: JSX.Element; redirectTo?: string }> = {
  "about": {
    title: "About",
    content: <div />,
    redirectTo: "/about"
  },
  "contact": {
    title: "Contact",
    content: <div />,
    redirectTo: "/contact"
  },
  "faqs": {
    title: "FAQs",
    content: <div />,
    redirectTo: "/faqs"
  },
  "blog": {
    title: "Blog",
    content: <div />,
    redirectTo: "/blog"
  },
  "terms": {
    title: "Terms of Service",
    content: <div />,
    redirectTo: "/terms"
  },
  "privacy": {
    title: "Privacy Policy",
    content: <div />,
    redirectTo: "/privacy"
  },
  "cookies": {
    title: "Cookie Policy",
    content: <div />,
    redirectTo: "/cookies"
  }
};

export default function StaticPage({ params }: { params: { pages: string[] } }) {
  const pageSlug = params.pages.join("-");
  const page = staticPages[pageSlug];

  if (!page) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="text-blue-600 hover:underline font-semibold text-lg">
              Go Back Home
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (page.redirectTo) {
    return notFound();
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>
        {page.content}
      </div>
    </PublicLayout>
  );
}
