import Icon from "./Icon";
export default function ToolbarButton({ name, onClick, isActive, title, disabled, children, }) {
    return (<button onClick={onClick} disabled={disabled} className={`relative p-2 rounded-md transition-colors duration-200 ${isActive ? "bg-black/20 dark:bg-white/20" : ""} ${disabled
            ? "opacity-50 cursor-not-allowed cursor-not-allowed"
            : "hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"}`} title={title}>
      <Icon name={name}/>
      {children}
    </button>);
}
//# sourceMappingURL=ToolbarButton.js.map