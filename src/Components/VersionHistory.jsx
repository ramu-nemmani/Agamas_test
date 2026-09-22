import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const typeBadge = {
    major: "text-[#cd5c3d] border-[#cd5c3d]/40",
    minor: "text-black border-[#e8e0d8]",
    patch: "text-black border-[#e8e0d8]",
};

export default function VersionHistory() {
    const navigate = useNavigate();
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch("/version-history.json")
            .then((res) => res.json())
            .then((data) => {
                setVersions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggle = (version) => {
        setExpanded((prev) => (prev === version ? null : version));
    };

    return (
        <div
            className="min-h-screen bg-[#fdf8f4] px-6 py-10 text-black font-serif-display"
        >
            {/* Top accent stripe */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#cd5c3d] to-transparent opacity-60 mb-10" />

            <div className="mx-auto max-w-4xl">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-black hover:text-[#cd5c3d] transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl text-[#cd5c3d]">Version History</h1>
                        <p className="text-sm text-black mt-1.5 tracking-wide">
                            All updates and releases for The Agamas
                        </p>
                    </div>

                    {/* Latest pill */}
                    {versions.length > 0 && (
                        <div className="section-eyebrow hidden sm:inline-flex">
                            <span className="section-eyebrow-dot" />
                            Latest: {versions[0].version}
                        </div>
                    )}
                </div>

                {/* Table Card */}
                <div className="bg-white border border-[#e8e0d8] rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-black text-sm">
                            Loading...
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div
                                className="hidden sm:grid border-b border-[#e8e0d8] px-6 py-3 text-xs font-semibold text-black uppercase tracking-widest"
                                style={{ gridTemplateColumns: "130px 110px 200px 1fr 36px" }}
                            >
                                <div>Version</div>
                                <div>Type</div>
                                <div>Release Date</div>
                                <div>Changes</div>
                                <div />
                            </div>

                            {/* Rows */}
                            {versions.map((entry, idx) => {
                                const isExpanded = expanded === entry.version;
                                const isLast = idx === versions.length - 1;

                                return (
                                    <div
                                        key={entry.version}
                                        className={!isLast ? "border-b border-[#e8e0d8]" : ""}
                                    >
                                        {/* Clickable Row */}
                                        <div
                                            onClick={() => toggle(entry.version)}
                                            className="cursor-pointer hover:bg-[#fdf3ec] transition-colors px-6 py-4"
                                        >
                                            {/* Desktop grid */}
                                            <div
                                                className="hidden sm:grid items-center"
                                                style={{ gridTemplateColumns: "130px 110px 200px 1fr 36px" }}
                                            >
                                                {/* Version */}
                                                <div className="font-mono text-sm font-semibold text-black">
                                                    {entry.version}
                                                </div>

                                                {/* Type badge */}
                                                <div>
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-full border text-xs capitalize bg-transparent ${typeBadge[entry.type] || typeBadge.patch
                                                            }`}
                                                    >
                                                        {entry.type}
                                                    </span>
                                                </div>

                                                {/* Date */}
                                                <div className="text-sm text-black">
                                                    {formatDate(entry.date)}
                                                </div>

                                                {/* Changes summary */}
                                                <div className="flex flex-wrap gap-4">
                                                    {entry.changes.map((group) => (
                                                        <span
                                                            key={group.category}
                                                            className="flex items-center gap-1.5 text-sm text-black"
                                                        >
                                                            <span>{group.icon}</span>
                                                            <span>{group.category}</span>
                                                            <span className="font-mono text-xs text-black bg-[#fdf8f4] rounded-full px-1.5 py-0.5 border border-[#e8e0d8]">
                                                                {group.items.length}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Chevron */}
                                                <div className="flex justify-center">
                                                    <ChevronDown
                                                        className="h-4 w-4 text-black transition-transform duration-200"
                                                        style={{
                                                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Mobile layout */}
                                            <div className="sm:hidden flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono font-semibold text-sm text-black">
                                                            {entry.version}
                                                        </span>
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-full border text-xs capitalize bg-transparent ${typeBadge[entry.type] || typeBadge.patch
                                                                }`}
                                                        >
                                                            {entry.type}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-black mb-2">
                                                        {formatDate(entry.date)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.changes.map((group) => (
                                                            <span
                                                                key={group.category}
                                                                className="flex items-center gap-1 text-xs text-black"
                                                            >
                                                                <span>{group.icon}</span>
                                                                <span>{group.category}</span>
                                                                <span className="font-mono text-black bg-[#fdf8f4] rounded-full px-1.5 border border-[#e8e0d8]">
                                                                    {group.items.length}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className="h-4 w-4 text-black flex-shrink-0 mt-1 transition-transform duration-200"
                                                    style={{
                                                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="bg-[#fdf8f4] border-t border-[#e8e0d8] px-6 py-5">
                                                <div
                                                    className="grid gap-6"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${entry.changes.length}, 1fr)`,
                                                    }}
                                                >
                                                    {entry.changes.map((group) => (
                                                        <div key={group.category}>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-base">{group.icon}</span>
                                                                <span className="font-semibold text-sm text-black">
                                                                    {group.category}
                                                                </span>
                                                            </div>
                                                            <ul className="space-y-2">
                                                                {group.items.map((item, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5">
                                                                        <span className="mt-2 w-1 h-1 rounded-full bg-[#cd5c3d]/50 flex-shrink-0" />
                                                                        <span className="text-sm text-black leading-relaxed">
                                                                            {item}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Release count */}
                {!loading && (
                    <p className="text-center text-xs text-black mt-4 tracking-wide">
                        {versions.length} release{versions.length !== 1 ? "s" : ""}
                    </p>
                )}

                {/* Bottom accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#cd5c3d] to-transparent opacity-40 mt-10" />
            </div>
        </div>
    );
}
