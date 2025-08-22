"use client";
import { useState } from "react";
import Card from "./components/card";

export default function Home() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File) => {
    setError(null);
    const t = await f.text();
    try {
      JSON.parse(t); // แค่ตรวจว่าเป็น JSON ก่อน
      setText(t);
      console.log("🚀 ~ onFile ~ t:", t);
    } catch (e: any) {
      setError(e.message ?? "Invalid JSON");
    }
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">JSON-PWIN</h1>
      <div className="space-y-2">
        <textarea
          className="w-full h-40 rounded border p-2"
          placeholder="วาง JSON ตรงนี้..."
          value={text}
          onChange={(e) => {
            setError(null);
            setText(e.target.value);
            try {
              if (e.target.value) JSON.parse(e.target.value);
            } catch (err: any) {
              setError(err.message ?? "Invalid JSON");
            }
          }}
        />
        <div className="flex gap-2 items-center">
          <label className="rounded border px-3 py-2 cursor-pointer">
            อัปโหลดไฟล์ JSON
            <input
              type="file"
              accept="application/json,.json,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </label>
          <button
            className={`rounded bg-black text-white px-3 py-2 ${
              !text ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!text}
            onClick={() => {
              try {
                JSON.parse(text);
                sessionStorage.setItem("JSON_PWIN_INLINE", text);
                window.location.href = "/view?inline=1";
              } catch (err: any) {
                setError(err.message ?? "Invalid JSON");
              }
            }}
          >
            เปิดดูทันที
          </button>
        </div>
      </div>
      {error && <p className="text-red-600">Error: {error}</p>}
      <p className="text-sm text-neutral-600">
        เดโม่: วาง JSON หรืออัปไฟล์ → คลิก “เปิดดูทันที” เพื่อดูในหน้า /view
        (แบบ inline)
      </p>
      <Card
        data={{
          test: "value",
        }}
      />
    </main>
  );
}
