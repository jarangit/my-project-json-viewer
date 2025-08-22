"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, Key } from "react";
import { v4 as uuidv4 } from "uuid";
import { JsonViewer } from "@textea/json-viewer";
import Card from "../components/card";
import TreeJsonView from "../components/tree-json-view";
import Breadcrumb from "../components/breadcrumb";
import { jsonUtils } from "@/utils/json-utils";

const Monaco = dynamic(() => import("../components/jsonCode"), { ssr: false });

export default function ViewPage() {
  const [raw, setRaw] = useState<string>("");
  const [path, setPath] = useState<any[]>([]);
  const [dataForCardPreview, setDataForCardPreview] = useState<any>(undefined);
  const data = useMemo(() => {
    function addId(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map((item) => addId(item));
      } else if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
          Object.entries(obj)
            .map(([k, v]) => [k, addId(v)])
            .concat([["jspUUID", uuidv4()]])
        );
      }
      return obj;
    }
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return addId(parsed);
    } catch {
      return null;
    }
  }, [raw]);

  const onSelectNode = (node: any) => {
    console.log("🚀 ~ onSelectNode ~ node:", node);
    setDataForCardPreview(node);
    const uuid = node?.value?.jspUUID;
    const found = jsonUtils.findById(data, uuid);
    const rawPath: any = jsonUtils.getPathById(data, uuid)?.map((i) => ({
      label: i,
      href: `/${i}`,
    }));
    setPath(rawPath);
  };

  // รับโหมด inline จากหน้าแรก
  useEffect(() => {
    const inline = sessionStorage.getItem("JSON_PWIN_INLINE");
    if (inline) setRaw(inline);
    console.log(data);
  }, []);

  const [tab, setTab] = useState<"tree" | "code">("tree");

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Viewer</h1>

        <div className="ml-auto flex rounded border">
          <button
            className={`px-3 py-1 ${
              tab === "tree" ? "bg-black text-white" : ""
            }`}
            onClick={() => setTab("tree")}
          >
            Tree
          </button>
          <button
            className={`px-3 py-1 ${
              tab === "code" ? "bg-black text-white" : ""
            }`}
            onClick={() => setTab("code")}
          >
            Code
          </button>
        </div>
      </div>

      {!raw && (
        <textarea
          className="w-full h-40 rounded-xl border p-2"
          placeholder="วาง JSON ตรงนี้..."
          onChange={(e) => setRaw(e.target.value)}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 overflow-auto">
          {/* treen view */}
          <TreeJsonView
            data={data || {}}
            _onSelectNode={(e: any) => onSelectNode(e)}
          />
          {/* {tab === "tree" && data && (
            <div className="rounded border p-2 max-h-[100vh] overflow-auto">
              <JsonViewer value={data} rootName={false} enableClipboard />
            </div>
          )}
          {tab === "code" && (
            <div>
              <Monaco value={raw} onChange={setRaw} />
            </div>
          )} */}
        </div>
        <div className="col-span-3 bg-gray-200 rounded-3xl p-6  max-h-[100vh] overflow-auto flex flex-col gap-6">
          <Breadcrumb items={path} />
          <div
            className={`grid gap-4 ${
              dataForCardPreview?.value &&
              !Array.isArray(dataForCardPreview?.value)
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
            }`}
          >
            {dataForCardPreview && path && Array.isArray(dataForCardPreview?.value) ? (
              dataForCardPreview?.value.map(
                (item: object, index: Key | null | undefined) => (
                  <Card
                    path={path}
                    key={index}
                    data={item}
                    title={dataForCardPreview?.key}
                  />
                )
              )
            ) : (
              <div className="col-span-3">
                <Card
                  path={path}
                  data={dataForCardPreview?.value || {}}
                  title={dataForCardPreview?.key}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* card */}
    </main>
  );
}
