import React from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = "/" }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.href ? (
              <a
                href={item.href}
                className="text-gray-600 hover:underline cursor-pointer"
                onClick={item.onClick}
              >
                {item.label}
              </a>
            ) : (
              <span className="text-gray-700">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-gray-400">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;