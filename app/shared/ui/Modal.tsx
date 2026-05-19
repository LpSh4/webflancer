import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({
                          isOpen,
                          onClose,
                          title,
                          children,
                          maxWidth = "max-w-md"
                      }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`glass-panel w-full ${maxWidth} rounded-3xl p-8 relative shadow-2xl border border-white/10`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                    ✕
                </button>

                {title && (
                    <h2 className="text-xl font-bold text-white mb-6">
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    );
}