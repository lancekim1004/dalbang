"use client";
import dynamic from "next/dynamic";
import type { MapPin } from "./types";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line" />,
});

export function MapView({ pins, interactive }: { pins: MapPin[]; interactive?: boolean }) {
  return <MapInner pins={pins} interactive={interactive} />;
}
