import Image from "next/image";
import type { Photo } from "@/lib/types";

/** 휴대폰: 옆으로 넘기는 사진 / 컴퓨터: 큰 사진 1장 + 작은 사진 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return <div className="aspect-[16/9] rounded-2xl bg-line" />;
  const [first, ...rest] = photos;
  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:hidden">
        {photos.map((p, i) => (
          <div key={p.id} className="relative aspect-[4/3] w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl bg-line">
            <Image src={p.url} alt={p.altText} fill priority={i === 0} sizes="90vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div className={`hidden gap-2 overflow-hidden rounded-2xl sm:grid ${rest.length ? "sm:grid-cols-[2fr_1fr]" : ""}`}>
        <div className="relative aspect-[4/3] bg-line">
          <Image src={first.url} alt={first.altText} fill priority sizes="(min-width: 1024px) 700px, 66vw" className="object-cover" />
        </div>
        {rest.length > 0 && (
          <div className="grid gap-2">
            {rest.slice(0, 2).map((p) => (
              <div key={p.id} className="relative bg-line">
                <Image src={p.url} alt={p.altText} fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
