interface Bid {
    id: string;
    developerName: string;
    price: number;
    days: number;
    comment: string;
    createdAt: string;
}

export function BidCard({ bid }: { bid: Bid }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-900">{bid.developerName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(bid.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-black text-slate-900">{bid.price} $</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{bid.days} дн.</div>
                </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {bid.comment}
            </p>
        </div>
    );
}