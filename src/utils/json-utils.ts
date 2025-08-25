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
    const search = (obj: any, path: string[] = []) => {
      if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          const currentPath = [...path, key];
          if (typeof obj[key] === "string" && obj[key].includes(searchTerm)) {
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
};
