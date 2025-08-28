import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import React, { useState } from "react";
import { jsonUtils } from "@/utils/json-utils";

type Props = {
  data: object;
  _onSelectNode: (node: any) => void;
  currentKey?: string;
};

function TreeNode({
  nodeKey,
  value,
  _onSelectNode,
  currentKey,
}: {
  nodeKey: string;
  value: any;
  _onSelectNode: (node: any) => void;
  currentKey?: string;
}) {
  const [open, setOpen] = useState(nodeKey === "root");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const isArrayString =
    Array.isArray(value) && value.every((v: unknown) => typeof v === "string");
  const isArray = Array.isArray(value) && !isArrayString;
  const isObject =
    typeof value === "object" && value !== null && !Array.isArray(value);

  const canExpand = isArray || isObject;

  const handleSelectNode = () => {
    _onSelectNode({ key: nodeKey, value });
    canExpand && setOpen((o) => !o);
  };

  return (
    <div className="max-h-[100vh]">
      <div
        className={`flex items-center gap-2 ${
          canExpand ? " cursor-pointer" : ""
        } ${currentKey === nodeKey ? "bg-blue-100" : ""}`}
        onClick={() => handleSelectNode()}
      >
        {canExpand && (
          <>
            <span className="text-xs px-1 py-0.5 rounded bg-gray-300">
              {open ? "-" : "+"}
            </span>
          </>
        )}

        {(isObject || isArray) && (
          <div className="my-1">
            <div>
              <span className="font-medium text-gray-800">{nodeKey}:</span>
              {isArray ? (
                <span className="text-purple-600 whitespace-nowrap">
                  {`Array (${value.length} items)`}
                </span>
              ) : isObject ? (
                <span className="text-sky-600 whitespace-nowrap">
                  {"Object"} {Object.keys(value).length} keys
                </span>
              ) : (
                <span className="text-orange-600 whitespace-nowrap">
                  {String(value)}
                </span>
              )}
            </div>
            <Progress
              className="max-w-[100px]"
              value={Object.keys(value).length}
            />
          </div>
        )}
      </div>
      {open && (
        <div className="ml-1 border-l pl-2">
          {isArray &&
            value.map((item: any, idx: number) => (
              <TreeNode
                key={idx}
                nodeKey={String(idx)}
                value={item}
                _onSelectNode={_onSelectNode}
                currentKey={currentKey}
              />
            ))}
          {isObject &&
            Object.entries(value).map(([k, v]) => (
              <TreeNode
                key={k}
                nodeKey={k}
                value={v}
                _onSelectNode={_onSelectNode}
                currentKey={currentKey}
              />
            ))}
        </div>
      )}
    </div>
  );
}

const TreeJsonView = ({ data, _onSelectNode }: Props) => {
  const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const handleSelectNode = (node: any) => {
    setCurrentKey(node.key);
    _onSelectNode(node);
  };
  const onSearch = (searchTerm: string) => {
    setSearchText(searchTerm);
    const results = jsonUtils.search(data, searchTerm);
    if (results?.length) {
      setSearchResult(results);
    }
    console.log("Search results:", results);
  };
  return (
    <div className=" h-full overflow-x-scroll ">
      <Input placeholder="Search" onChange={(e) => onSearch(e.target.value)} />
      {searchResult?.length && searchText && (
        <ul className="flex flex-col gap-2 mt-2 max-h-[400px] overflow-auto">
          {searchResult.map((result, key) => {
            // ไฮไลท์เฉพาะส่วนที่ตรงกับ searchText
            const value = String(result.value);
            const parts = searchText
              ? value.split(new RegExp(`(${searchText})`, "gi"))
              : [value];
            return (
              <li key={key} className="bg-gray-200 p-3 rounded-xl">
                <div className="text-gray-400">
                  Path: {result.path.join(" > ")}
                </div>
                <div>
                  {parts.map((part, idx) =>
                    part.toLowerCase() === searchText.toLowerCase() ? (
                      <span key={idx} className="bg-yellow-300 text-black rounded px-1">
                        {part}
                      </span>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <TreeNode
        nodeKey="root"
        value={data}
        _onSelectNode={handleSelectNode}
        currentKey={currentKey}
      />
    </div>
  );
};

export default TreeJsonView;
