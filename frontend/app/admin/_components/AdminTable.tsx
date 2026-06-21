import type { ReactNode } from "react";

interface AdminTableProps {
    headers: string[];
    rows: ReactNode[][];
    empty?: string;
}

export default function AdminTable({ headers, rows, empty }: AdminTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-ink-200 bg-surface">
            <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-2.5">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-4 py-10 text-center text-ink-400">
                                {empty ?? "Nothing here yet."}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="text-ink-700 hover:bg-ink-50/50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2.5 align-top">{cell}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
