import {HiChevronLeft, HiChevronRight} from "react-icons/hi2";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({currentPage, totalPages, onPageChange}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#0d1930]/50 border border-blue-500/10 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <HiChevronLeft size={16}/>
            </button>

            <div className="flex items-center gap-1">
                {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                                ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-500"
                                : "bg-transparent text-slate-500 hover:text-white hover:bg-blue-500/10"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#0d1930]/50 border border-blue-500/10 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
                <HiChevronRight size={16}/>
            </button>
        </div>
    );
}