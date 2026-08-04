import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

function PgBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed
        ${active
          ? 'bg-slate-800 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
      {children}
    </button>
  );
}

export default function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage) || 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages]);
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.add(i);
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
      result.push(p);
    });
    return result;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500 flex-wrap gap-2">
      <span>
        {total === 0
          ? 'Sin registros'
          : `Mostrando ${from}–${to} de ${total} registro${total !== 1 ? 's' : ''}`}
      </span>
      <div className="flex items-center gap-0.5">
        <PgBtn onClick={() => onChange(1)}          disabled={page === 1}>
          <ChevronsLeft className="w-4 h-4" />
        </PgBtn>
        <PgBtn onClick={() => onChange(page - 1)}   disabled={page === 1}>
          <ChevronLeft className="w-4 h-4" />
        </PgBtn>

        {getPages().map((p, i) =>
          p === '…'
            ? <span key={`d${i}`} className="px-1.5 text-slate-400 select-none">…</span>
            : <PgBtn key={p} active={p === page} onClick={() => onChange(p)}>{p}</PgBtn>
        )}

        <PgBtn onClick={() => onChange(page + 1)}   disabled={page === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </PgBtn>
        <PgBtn onClick={() => onChange(totalPages)} disabled={page === totalPages}>
          <ChevronsRight className="w-4 h-4" />
        </PgBtn>
      </div>
    </div>
  );
}
