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
  actionText = "Learn More",
  tags,
  deadline,
}: CatalogCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {image && (
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      )}

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {Object.entries(details).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>

        {deadline && (
          <p className="text-sm text-red-600 mb-3 font-semibold">Closes: {deadline}</p>
        )}

        <Link
          href={link}
          className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700"
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
}
