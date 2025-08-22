import { create } from "zustand";

type State = {
  collapsedPaths: Set<string>;
  setCollapsed: (path: string, collapsed: boolean) => void;
};

export const useViewerStore = create<State>((set, get) => ({
  collapsedPaths: new Set(),
  setCollapsed: (path, collapsed) => {
    const next = new Set(get().collapsedPaths);
    collapsed ? next.add(path) : next.delete(path);
    set({ collapsedPaths: next });
  },
}));