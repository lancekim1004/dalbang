"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { List, Map as MapIcon } from "lucide-react";

/** 휴대폰: 목록 ⇄ 지도 전환 버튼 / 컴퓨터: 좌우로 나란히 */
export function RoomsBrowser({ list, map }: { list: React.ReactNode; map: React.ReactNode }) {
  const t = useTranslations("Rooms");
  const [view, setView] = useState<"list" | "map">("list");
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-6">
      <div className={view === "map" ? "hidden lg:block" : ""}>{list}</div>
      <div className={view === "list" ? "hidden lg:block" : ""}>
        <div className="h-[calc(100dvh-11rem)] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]">
          {map}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setView(view === "list" ? "map" : "list")}
        className="fixed bottom-5 left-1/2 z-[1100] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl lg:hidden"
      >
        {view === "list" ? <MapIcon className="h-4 w-4" aria-hidden="true" /> : <List className="h-4 w-4" aria-hidden="true" />}
        {view === "list" ? t("showMap") : t("showList")}
      </button>
    </div>
  );
}
