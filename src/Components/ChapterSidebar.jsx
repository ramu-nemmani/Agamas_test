import { Link } from "react-router-dom";
import { LANGUAGES } from "../constants/languages";

export default function ChapterSidebar({
  chapterId,
  postsOrders,
  activePos,
  activeLang,
}) {
  const entries = Object.entries(postsOrders || {}).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );
  return (
    <aside className="w-64 shrink-0 border-r pr-4">
      <div className="text-xs text-neutral-500 mb-2">Positions</div>
      <div className="space-y-1 max-h-[70vh] overflow-auto pr-2">
        {entries.map(([pos, map]) => {
          const available = LANGUAGES.filter((l) => map?.[l.key]);
          const isActive = Number(activePos) === Number(pos);
          return (
            <Link
              key={pos}
              to={`/chapters/${chapterId}?pos=${pos}&lang=${activeLang}`}
              className={`block px-2 py-1 rounded ${
                isActive ? "bg-neutral-200" : "hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono">#{pos}</div>
                <div className="flex gap-1">
                  {available.map((l) => (
                    <span
                      key={l.key}
                      title={l.label}
                      className="inline-block w-2 h-2 rounded-full bg-[color:var(--brand)]"
                    ></span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
