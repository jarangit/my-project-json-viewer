"use client";
/* eslint-disable react/display-name */
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

type ColorSelectorNodeProps = {
  data: {
    color: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  };
  isConnectable: boolean;
};

export default memo(({ data, isConnectable }: ColorSelectorNodeProps) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div>
        Custom Color Picker Node: <strong>{data.color}</strong>
      </div>
      <input
        className="nodrag"
        type="color"
        onChange={data.onChange}
        defaultValue={data.color}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </>
  );
});
