import { create } from "zustand";
import { Action, TypesTools } from "../types";
const color = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "#ffffff"
    : "#000000";
const useAppState = create((set) => ({
    isInitialized: false,
    setIsInitialized: (isInitialized) => set({ isInitialized }),
    dimensions: { width: window.innerWidth, height: window.innerHeight },
    setDimensions: (dimensions) => set({ dimensions }),
    color,
    setColor: (color) => set({ color }),
    isInToolbar: false,
    setIsInToolbar: (isInToolbar) => set({ isInToolbar }),
    tool: TypesTools.Pencil,
    setTool: (tool) => set({ tool }),
    action: Action.None,
    setAction: (action) => set({ action }),
    activeElement: null,
    setActiveElement: (activeElement) => set({ activeElement }),
    selectedElements: [],
    setSelectedElements: (selectedElements) => set({ selectedElements }),
    panOffset: { x: 0, y: 0 },
    setPanOffset: (panOffset) => set({ panOffset }),
    startPanMousePosition: { x: 0, y: 0 },
    setStartPanMousePosition: (startPanMousePosition) => set({ startPanMousePosition }),
    history: [[]],
    setHistory: (history) => set({ history }),
    historyIndex: 0,
    setHistoryIndex: (historyIndex) => set({ historyIndex }),
    pendingEraseIds: [],
    setPendingEraseIds: (pendingEraseIds) => set({ pendingEraseIds }),
    copiedElements: [],
    setCopiedElements: (copiedElements) => set({ copiedElements }),
}));
export default useAppState;
//# sourceMappingURL=state.js.map