import { MessageSquare } from "lucide-react";

export interface AIChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasUnread?: boolean;
}

export function AIChatButton({ onClick, isOpen, hasUnread = false }: AIChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-[#0b1224] hover:scale-105 ${
        isOpen ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-500"
      }`}
      aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
    >
      <div
        className={`relative flex h-7 w-7 items-center justify-center transition-transform duration-300 ${
          isOpen ? "rotate-45" : "rotate-0"
        }`}
      >
        <MessageSquare className="h-7 w-7" />
        {hasUnread && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </div>
    </button>
  );
}

export default AIChatButton;
