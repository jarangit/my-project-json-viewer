"use client";
import React from "react";

interface props {
  data: Array<{ label: string; href: string }>;
}
export default function PathOutput({ data }: props) {
  // แปลง array -> string
  const path = data
    .map((d, i, arr) => {
      // ถ้า label เป็นตัวเลข -> แสดงเป็น [num]
      if (/^\\d+$/.test(d.label)) {
        return `[${d.label}]`;
      } else {
        // ถ้า label ก่อนหน้าเป็นตัวเลข ไม่ต้องใส่ dot (เพราะ index ต่อกับ key เลย)
        const prev = arr[i - 1];
        if (prev && /^\\d+$/.test(prev.label)) {
          return d.label;
        }
        return d.label;
      }
    })
    .join(".");

  return <div className="text-sm text-gray-500">path: {path}</div>;
}
