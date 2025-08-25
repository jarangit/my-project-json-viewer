"use client";
import React from "react";

interface props {
  data: Array<{ label: string; href: string }>;
}
export default function PathOutput({ data }: props) {
  // แปลง array -> string
  let path = "";
  for (const { label } of data) {
    const isIndex = /^\d+$/.test(label);
    if (isIndex) {
      // index ต่อท้าย segment เดิมด้วย [n]
      path += `[${label}]`;
    } else {
      // key ใหม่: ถ้ามีของเดิมแล้ว คั่นด้วยจุด
      if (path) path += ".";
      path += label;
    }
  }

  return <div className="text-sm text-gray-500">path: {path}</div>;
}
