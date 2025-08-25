import React from "react";
import { FaRegCopy } from "react-icons/fa";
import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import { IoMdMore } from "react-icons/io";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import GroupedList from "./grouped-list";
import ChainDisplay from "./chain-display";
import PathOutput from "./path-display";
type Props = {
  data: object;
  title: string;
  path: Array<{ label: string; href: string }>;
};

const Card = ({ data, title, path }: Props) => {
  // ฟังก์ชันแยก type และ class สีแบบ static
  const typeColorMap: Record<
    string,
    { label: string; value: string; badge: string }
  > = {
    string: {
      label: "text-blue-500",
      value: "text-blue-500",
      badge: "bg-blue-100 text-blue-700 border-blue-300",
    },
    number: {
      label: "text-green-500",
      value: "text-green-500",
      badge: "bg-green-100 text-green-700 border-green-300",
    },
    boolean: {
      label: "text-orange-500",
      value: "text-orange-500",
      badge: "bg-orange-100 text-orange-700 border-orange-300",
    },
    array: {
      label: "text-purple-500",
      value: "text-purple-500",
      badge: "bg-purple-100 text-purple-700 border-purple-300",
    },
    object: {
      label: "text-sky-500",
      value: "text-sky-500",
      badge: "bg-sky-100 text-sky-700 border-sky-300",
    },
    unknown: {
      label: "text-red-500",
      value: "text-red-500",
      badge: "bg-red-100 text-red-700 border-red-300",
    },
  };
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // สร้าง backdrop/layer สำหรับ export
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = cardRef.current.offsetWidth + "px";
      wrapper.style.background =
        "linear-gradient(135deg, #94BBE9 0%, #EEAECA 100%)";
      wrapper.style.padding = "32px";

      // clone card
      const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
      cardClone.style.position = "relative";
      cardClone.style.zIndex = "2";
      cardClone.style.background = "rgba(255,255,255,0.95)";
      cardClone.style.borderRadius = "1rem";
      cardClone.style.boxShadow = "0 4px 32px 0 rgba(0,0,0,0.08)";
      wrapper.appendChild(cardClone);
      // watermark
      const watermark = document.createElement("div");
      watermark.innerText = "jsp.dev";
      watermark.style.position = "absolute";
      watermark.style.right = "24px";
      watermark.style.opacity = "0.25";
      watermark.style.fontSize = "1rem";
      watermark.style.fontWeight = "bold";
      watermark.style.color = "#2563eb";
      watermark.style.zIndex = "3";
      watermark.style.pointerEvents = "none";
      wrapper.appendChild(watermark);
      // hidden for export
      wrapper.style.pointerEvents = "none";
      wrapper.style.overflow = "hidden";
      document.body.appendChild(wrapper);
      // export image
      const dataUrl = await htmlToImage.toPng(wrapper, {
        quality: 3.0,
        backgroundColor: undefined,
      });
      document.body.removeChild(wrapper);
      const link = document.createElement("a");
      link.download = `jps-${title}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    }
  };

  const getType = (v: any): keyof typeof typeColorMap => {
    if (Array.isArray(v)) return "array";
    if (typeof v === "string") return "string";
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "object" && v !== null) return "object";
    return "unknown";
  };

  const [showType, setShowType] = React.useState(false);

  // สร้าง TypeScript type string จาก data
  function toTsType(obj: any, indent = 2): string {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span class="text-gray-500">any[]</span>';
      return toTsType(obj[0], indent) + '<span class="text-gray-500">[]</span>';
    }
    if (typeof obj === "object" && obj !== null) {
      let result = '<span class="text-gray-400">{</span><br/>';
      Object.entries(obj)
        .filter(([key]) => key !== "id" && key !== "jspUUID")
        .forEach(([key, value]) => {
          result += `${"&nbsp;".repeat(
            indent
          )}<span class="text-blue-500 font-semibold">${key}</span>: <span class="text-orange-500">${toTsType(
            value,
            indent + 2
          )}</span>;<br/>`;
        });
      result += `${"&nbsp;".repeat(
        indent - 2
      )}<span class="text-gray-400">}</span>`;
      return result;
    }
    return `<span class="text-green-500">${typeof obj}</span>`;
  }

  return (
    <div className="rounded-2xl p-6 bg-white" ref={cardRef}>
      <div className="mb-3 flex justify-between items-start">
        <div>
          <div className="font-semibold text-2xl">{title}</div>
          <PathOutput data={path ?? []} />
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <IoMdMore size={25} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownload}>
                Download image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowType((v) => !v)}>
                {showType ? " Display Table" : "Display TS Type"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {showType ? (
        <div className="relative">
          <button
            className="absolute top-2 right-2 p-2 rounded hover:bg-gray-800 text-white"
            title="Copy TypeScript type"
            onClick={() => {
              navigator.clipboard.writeText(
                toTsType(data)
                  .replace(/<[^>]+>/g, "")
                  .replace(/&nbsp;/g, " ")
              );
            }}
          >
            {/* React icon: Copy (from react-icons) */}
            <FaRegCopy />
          </button>
          <pre className="bg-gray-900 rounded-3xl p-6 overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: toTsType(data) }} />
          </pre>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-100 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold text-gray-600">
                  Field
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Type
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Value
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data)
                .filter(([key]) => key !== "id" && key !== "jspUUID")
                .map(([key, value]) => {
                  const type = getType(value);
                  const color = typeColorMap[type];
                  const displayValue = Array.isArray(value)
                    ? Array.isArray(value) &&
                      value.every((v) => typeof v === "string")
                      ? JSON.stringify(value)
                      : `Array (${value.length} items)`
                    : String(value);
                  return (
                    <tr
                      key={key}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="p-3 font-medium text-gray-700 whitespace-nowrap align-top">
                        {key}
                      </td>
                      <td className="p-3 whitespace-nowrap align-top">
                        <span
                          className={`px-2 py-0.5 rounded text-xs border ${color.badge}`}
                        >
                          {type}
                        </span>
                      </td>
                      <td
                        className="p-3 font-mono cursor-pointer align-top"
                        title={displayValue}
                      >
                        {displayValue}
                      </td>
                      <td className="p-3 align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <IoMdMore size={25} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(displayValue);
                              }}
                            >
                              Copy value
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(`data.${key}`);
                              }}
                            >
                              Copy pointer (JS)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Card;
