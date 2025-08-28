"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Card from "../card";
import CardNodeItem from "./card-node";
type Props = {
  data: IData;
};
interface IData {
  label?: string;
  children?: string;
  value?: unknown;
}
function CustomNode({ data }: Props) {
  console.log("🚀 ~ CustomNode ~ data:", data);
  return (
    <div className="">
      <div className="w-full min-w-[300px]">
        <CardNodeItem data={data} title={data.label} />
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}

export default memo(CustomNode);
