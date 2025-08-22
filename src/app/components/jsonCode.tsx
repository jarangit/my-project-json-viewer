"use client";
import { useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";

export default function JsonCode({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const handleChange = useCallback(
    (v?: string) => onChange(v ?? ""),
    [onChange]
  );
  return (
    <MonacoEditor
      height="60vh"
      defaultLanguage="json"
      value={value}
      onChange={handleChange}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        folding: true,
        formatOnPaste: true,
        formatOnType: false,
      }}
    />
  );
}
