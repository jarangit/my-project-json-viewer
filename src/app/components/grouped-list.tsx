"use client";
import React from "react";

const data = [
  { label: "item", href: "/item" },
  { label: "0", href: "/0" },
  { label: "item", href: "/item" },
  { label: "0", href: "/0" },
  { label: "request", href: "/request" },
];

export default function GroupedList() {
  // Group โดยใช้ label เป็น key
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.label]) acc[curr.label] = [];
    acc[curr.label].push(curr);
    return acc;
  }, {} as Record<string, { label: string; href: string }[]>);

  return (
    <div className="p-4 space-y-4">
      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} className="border rounded p-2">
          <h3 className="font-bold">{label}</h3>
          <ul className="list-disc pl-6">
            {items.map((item, index) => (
              <li key={index}>
                {label}[{index}].href = {item.href}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
