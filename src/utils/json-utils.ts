import { v4 as uuidv4 } from "uuid";

export type SchemaRow = {
  path: string;
  key: string;
  type: string;
  parentType: string;
  required: boolean;
  example?: any;
  format?: string;
};
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [k: string]: JSONValue };
export const jsonUtils = {
  findById: (data: any, id: string): any => {
    if (!data || typeof data !== "object") return null;
    if (data.jspUUID === id) return data;
    for (const key in data) {
      const result = jsonUtils.findById(data[key], id);
      if (result) return result;
    }
    return null;
  },

  // ฟังก์ชันค้นหา path ของ id
  getPathById: function (
    obj: any,
    id: string,
    path: any[] = []
  ): string[] | null {
    if (typeof obj !== "object" || obj === null) return null;
    if (obj.jspUUID === id) return path;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        const found = jsonUtils.getPathById(value, id, [...path, key]);
        if (found) return found;
      }
      if (Array.isArray(value)) {
        console.log("🚀 ~ value:", value);
        for (let i = 0; i < value.length; i++) {
          const found = jsonUtils.getPathById(value[i], id, [
            ...path,
            key,
            String(i),
          ]);
          if (found) return found;
        }
      }
    }
    return null;
  },
  search: (data: any, searchTerm: string): any[] => {
    const results: any[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    const search = (obj: any, path: string[] = []) => {
      if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          const currentPath = [...path, key];
          if (
            typeof obj[key] === "string" &&
            obj[key].toLowerCase().includes(lowerSearchTerm)
          ) {
            results.push({ key, value: obj[key], path: currentPath });
          } else {
            search(obj[key], currentPath);
          }
        }
      }
    };
    search(data);
    return results;
  },
  detectType(v: JSONValue): string {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    if (typeof v === "number")
      return Number.isInteger(v) ? "integer" : "number";
    return typeof v; // "string" | "boolean" | "object"
  },
  detectFormat(s: string): string | undefined {
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return "date-time";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "email";
    if (/^https?:\/\//.test(s)) return "uri";
    return undefined;
  },
  jsonToSchemaArray(
    data: JSONValue,
    opts: { root?: string } = {}
  ): SchemaRow[] {
    const rows: SchemaRow[] = [];
    const root = opts.root ?? "$";

    function pushRow(row: SchemaRow) {
      rows.push(row);
    }

    function walk(
      value: JSONValue,
      path: string,
      key: string,
      parentType: string
    ) {
      const t = jsonUtils.detectType(value);

      // primitive
      if (t !== "object" && t !== "array") {
        pushRow({
          path,
          key,
          type: t,
          parentType,
          required: true,
          example: value,
          format:
            typeof value === "string"
              ? jsonUtils.detectFormat(value)
              : undefined,
        });
        return;
      }

      // object
      if (t === "object") {
        pushRow({ path, key, type: "object", parentType, required: true });
        const obj = value as Record<string, JSONValue>;
        for (const k of Object.keys(obj)) {
          walk(obj[k], `${path}.${k}`, k, "object");
        }
        return;
      }

      // array
      if (t === "array") {
        pushRow({ path, key, type: "array", parentType, required: true });
        const arr = value as JSONValue[];
        // เดาชนิดของ item แบบง่ายจากตัวแรก (ถ้าว่าง ให้ใส่ any)
        if (arr.length === 0) {
          pushRow({
            path: `${path}[item]`,
            key: "[item]",
            type: "any",
            parentType: "array",
            required: false,
          });
        } else {
          // ถ้ามีชนิดปน → สร้าง union
          const types = Array.from(new Set(arr.map(jsonUtils.detectType)));
          const itemType =
            types.length === 1 ? types[0] : `union(${types.join("|")})`;
          // แถว meta ของ item
          pushRow({
            path: `${path}[item]`,
            key: "[item]",
            type: itemType,
            parentType: "array",
            required: true,
          });
          // ไล่ลงไปที่ตัวอย่างแรกเพื่อเก็บโครงสร้างลึก (พอเหมาะ)
          walk(arr[0], `${path}[0]`, "[0]", "array");
        }
        return;
      }
    }

    walk(data, root, root, "root");
    return rows;
  },
  /**
   * Build a simple left-to-right (horizontal) graph from JSON for React Flow.
   * - Each JSON path becomes a node; edges connect parent -> child
   * - Positions are computed by depth (x) and row index within the depth (y)
   * - Returns { nodes, edges } compatible with React Flow initialNodes/initialEdges
   */
  toFlowGraph(
    data: JSONValue,
    opts: {
      direction?: "LR" | "TB"; // currently LR optimized
      xGap?: number; // horizontal gap between columns
      yGap?: number; // vertical gap between rows
      rootLabel?: string; // label for root node
      maxNodes?: number; // safety cap for very large JSON
    } = {}
  ) {
    // หา object node พร้อมข้อมูล name, jspuuid, parentId
    type ObjectNodeInfo = {
      name: string;
      jspuuid?: string;
      parentId?: string;
      value?: any;
    };
    const result: ObjectNodeInfo[] = [];
    function walk(obj: any, parentId?: string) {
      // if (typeof obj !== "object" || obj === null) return;
      for (const key in obj) {
        const value = obj[key];
        const isArrayString =
          Array.isArray(value) &&
          value.every((v: unknown) => typeof v === "string");
        const isArray = Array.isArray(value) && !isArrayString;
        const isObject =
          typeof value === "object" && value !== null && !Array.isArray(value);
        if (isObject) {
          result.push({
            name: key,
            jspuuid: value?.jspUUID ?? undefined,
            parentId: parentId ?? undefined,
            value: value?.value ?? value,
          });
          walk(value, value.jspUUID ?? undefined);
        }
      }
    }
    walk(data);
    // เพิ่ม root node (jspuuid ตัวแรก) เป็นตัวแรกเสมอ
    let rootJspuuid: string | undefined = undefined;
    if (result.length > 0) {
      rootJspuuid = data?.jspUUID as string | undefined;
      result.unshift({
        name: "root",
        jspuuid: rootJspuuid,
        parentId: "",
      });
    }
    // ถ้าไม่มี parentId ให้ใช้ jspuuid ของ root
    if (rootJspuuid) {
      for (let i = 1; i < result.length; i++) {
        if (!result[i].parentId) {
          result[i].parentId = rootJspuuid;
        }
      }
    }
    return result;
  },
  addId({
    obj,
    type = "TREE",
  }: {
    obj: JSONValue;
    type?: "TREE" | "FLOW";
  }): JSONValue {
    if (Array.isArray(obj)) {
      // Wrap array in object with jspUUID
      if (type === "FLOW") {
        return {
          value: obj.map((item) => this.addId({ obj: item, type })),
          jspUUID: uuidv4(),
        };
      }
      if (type === "TREE") {
        return obj.map((item) => this.addId({ obj: item, type }));
      }
    } else if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, this.addId({ obj: v, type })])
          .concat([["jspUUID", uuidv4()]])
      );
    }
    return obj;
  },
};
