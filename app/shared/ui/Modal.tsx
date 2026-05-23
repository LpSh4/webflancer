import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className={`bg-white w-full ${maxWidth} rounded-2xl relative shadow-xl border border-slate-200 my-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    {title ? (
                        <h2 className="text-base font-bold text-slate-900">
                            {title}
                        </h2>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}