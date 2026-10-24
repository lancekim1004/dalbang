"use client";
// Leaflet 지도는 브라우저에서만 동작하므로 MapView에서 따로 불러온다.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { MapPin } from "./types";

const SEOUL: [number, number] = [37.5503, 126.991];

function pinIcon(label: string) {
  const span = document.createElement("span");
  span.className = "price-pin";
  span.textContent = label; // 글자로만 넣어 안전하게
  return L.divIcon({ html: span, className: "", iconSize: undefined });
}

/** 핀이 모두 보이게 맞추고, 지도 칸 크기가 바뀌면(목록⇄지도 전환) 다시 그림 */
function FitAndResize({ pins, containerRef }: { pins: MapPin[]; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 15);
      else if (pins.length > 1) map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 14 });
    };
    fit();
    const el = containerRef.current;
    if (!el) return;
    // 숨겨져 있던 지도가 보이게 되면(크기 0 → 실제 크기) 다시 맞춤
    let wasHidden = el.clientWidth === 0;
    const ro = new ResizeObserver(() => {
      const hidden = el.clientWidth === 0;
      if (wasHidden && !hidden) fit();
      else map.invalidateSize();
      wasHidden = hidden;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [map, pins, containerRef]);
  return null;
}

export default function MapInner({ pins, interactive = true }: { pins: MapPin[]; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="h-full w-full">
      <MapContainer center={SEOUL} zoom={12} scrollWheelZoom={interactive} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAndResize pins={pins} containerRef={ref} />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.label)} title={p.title}>
            {p.rooms.length > 0 && (
              <Popup>
                <a href={p.href} className="font-semibold">{p.title}</a>
                <ul className="mt-1 space-y-0.5">
                  {p.rooms.map((r) => (
                    <li key={r.href}>
                      <a href={r.href}>{r.name}</a> · {r.price}
                    </li>
                  ))}
                </ul>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
