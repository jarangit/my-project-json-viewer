import React, { useState } from "react";

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
    <div className="max-h-[100vh] ">
      <div
        className={`flex items-center gap-2${
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
          <>
            <span className="font-medium text-gray-800">{nodeKey}:</span>
            {isArray ? (
              <span className="text-purple-600 whitespace-nowrap">
                {`Array (${value.length} items)`}
              </span>
            ) : isObject ? (
              <span className="text-sky-600 whitespace-nowrap">
                {"Object"}
              </span>
            ) : (
              <span className="text-orange-600 whitespace-nowrap">
                {String(value)}
              </span>
            )}
          </>
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
  const handleSelectNode = (node: any) => {
    setCurrentKey(node.key);
    _onSelectNode(node);
  };
  return (
    <div className=" h-full overflow-x-scroll ">
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
