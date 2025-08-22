"use client";
import React from "react";

const data = [
  { label: "item", href: "/item" },
  { label: "0", href: "/0" },
  // { label: "item", href: "/item" },
  // { label: "0", href: "/0" },
  // { label: "request", href: "/request" },
];

export default function ChainDisplay() {
  // Group โดย label
  const grouped = data.reduce((acc, curr) => {
    if (!acc[curr.label]) acc[curr.label] = [];
    acc[curr.label].push(curr);
    return acc;
  }, {} as Record<string, { label: string; href: string }[]>);

  // สร้าง string ต่อกัน
  const chain = Object.entries(grouped)
    .map(([label, items]) =>
      items.map((_, index) => `${label}[${index}]`).join(".")
    )
    .join(".");

  return (
    <div className="p-4">
      <p className="font-mono text-lg">{chain}</p>
    </div>
  );
}
