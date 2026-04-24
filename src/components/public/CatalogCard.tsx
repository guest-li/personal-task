import Link from "next/link";

interface CatalogCardProps {
  title: string;
  image?: string;
  details: Record<string, string | number>;
  link: string;
  actionText?: string;
  tags?: string[];
  deadline?: string;
}

export function CatalogCard({
  title,
  image,
  details,
  link,
  actionText = "View Details",
  tags,
  deadline,
}: CatalogCardProps) {
  return (
    <div className="bg-white border border-brand-100 rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {image ? (
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-brand-50 to-brand-100" />
      )}

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {Object.entries(details).map(([key, value]) => (
            <p key={key}>
              <strong className="text-gray-700">{key}:</strong> {value}
            </p>
          ))}
        </div>

        {deadline && (
          <p className="text-sm text-accent-600 mb-3 font-semibold">Closes: {deadline}</p>
        )}

        <Link
          href={link}
          className="block w-full bg-gradient-to-r from-brand-700 to-brand-800 text-white text-center font-medium px-4 py-2 rounded-lg hover:from-brand-800 hover:to-brand-900 transition-all duration-200"
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
}
