// 예시 자료 (포트폴리오 데모용 가상 숙소). Supabase 연결 후에는 DB 시드(seed)로 옮긴다.
// 지도 좌표는 정확한 집이 아니라 동네 근처로 흐리게 잡음.
import { addDaysIso, todayInSeoul } from "@/lib/dates";
import type { BookedRange, District, Listing, Photo, Room } from "@/lib/types";

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

// 사진 모음 (Unsplash 무료 라이선스)
const P = {
  living1: U("photo-1522708323590-d24dbb6b0267"),
  living2: U("photo-1502672260266-1c1ef2d93688"),
  living3: U("photo-1560448204-e02f11c3d0e2"),
  living4: U("photo-1493809842364-78817add7ffb"),
  living5: U("photo-1554995207-c18c203602cb"),
  living6: U("photo-1600210492486-724fe5c67fb0"),
  living7: U("photo-1507089947368-19c1da9775ae"),
  interior1: U("photo-1513694203232-719a280e022f"),
  interior2: U("photo-1600607687939-ce8a6c25118c"),
  kitchen1: U("photo-1484154218962-a197022b5858"),
  kitchen2: U("photo-1556020685-ae41abfc9365"),
  desk: U("photo-1524758631624-e2822e304c36"),
  bed1: U("photo-1505693416388-ac5ce068fe85"),
  bed2: U("photo-1586023492125-27b2c045efd7"),
  bed3: U("photo-1598928506311-c55ded91a20c"),
  bed4: U("photo-1540518614846-7eded433c457"),
  bed5: U("photo-1615874959474-d609969a20ed"),
  bed6: U("photo-1617325247661-675ab4b64ae2"),
  bed7: U("photo-1631049307264-da0ec9d70304"),
  bed8: U("photo-1616594039964-ae9021a400a0"),
  bed9: U("photo-1595526114035-0d45ed16cfbf"),
  bed10: U("photo-1571508601891-ca5e7a713859"),
  bed11: U("photo-1505691938895-1758d7feb511"),
  house: U("photo-1600585154340-be6161a56a0c"),
};

/** 홈 화면 큰 사진 (남산타워 야경) */
export const HERO_PHOTO = U("photo-1546874177-9e664107314e");

function photos(ownerId: string, alt: string, urls: string[]): Photo[] {
  return urls.map((url, i) => ({ id: `${ownerId}-p${i + 1}`, url, altText: `${alt} — photo ${i + 1}`, sortOrder: i }));
}

export const districts: District[] = [
  { id: "d-mapo", slug: "mapo", nameEn: "Mapo · Hongdae", sortOrder: 1 },
  { id: "d-seodaemun", slug: "seodaemun", nameEn: "Seodaemun · Sinchon", sortOrder: 2 },
  { id: "d-jongno", slug: "jongno", nameEn: "Jongno · Bukchon", sortOrder: 3 },
  { id: "d-yongsan", slug: "yongsan", nameEn: "Yongsan · Itaewon", sortOrder: 4 },
  { id: "d-seongdong", slug: "seongdong", nameEn: "Seongdong · Seongsu", sortOrder: 5 },
  { id: "d-gangnam", slug: "gangnam", nameEn: "Gangnam", sortOrder: 6 },
  { id: "d-songpa", slug: "songpa", nameEn: "Songpa · Jamsil", sortOrder: 7 },
];

type ListingSeed = Omit<Listing, "photos" | "isPublished"> & { photoUrls: string[] };

const listingSeeds: ListingSeed[] = [
  {
    id: "l-hongdae-garden", districtId: "d-mapo", type: "sharehouse",
    title: "Hongdae Garden House",
    description: "A bright four-room share house on a quiet street, five minutes from Hongik Univ. Station. Shared kitchen, rooftop garden, and a friendly mix of students and creatives.",
    addressEn: "Seogyo-dong, Mapo-gu, Seoul", lat: 37.5546, lng: 126.9203,
    amenities: ["wifi", "washer", "kitchen", "rooftop", "airConditioning"],
    nearestStation: "Hongik Univ. (Line 2) · 5 min walk",
    photoUrls: [P.living1, P.kitchen1, P.living4],
  },
  {
    id: "l-yeonnam-studio", districtId: "d-mapo", type: "studio",
    title: "Yeonnam Park Studios",
    description: "Compact studios next to Gyeongui Line Forest Park. Each studio has its own bathroom and kitchenette — ideal for remote workers who want cafés on their doorstep.",
    addressEn: "Yeonnam-dong, Mapo-gu, Seoul", lat: 37.5625, lng: 126.9250,
    amenities: ["wifi", "washer", "airConditioning", "workspace"],
    nearestStation: "Hongik Univ. (Line 2) · 8 min walk",
    photoUrls: [P.interior1, P.desk],
  },
  {
    id: "l-sinchon-share", districtId: "d-seodaemun", type: "sharehouse",
    title: "Sinchon Campus Share",
    description: "Popular with language students at Yonsei and Sogang. Study lounge, weekly cleaning of shared spaces, and English-speaking house manager.",
    addressEn: "Changcheon-dong, Seodaemun-gu, Seoul", lat: 37.5590, lng: 126.9380,
    amenities: ["wifi", "washer", "kitchen", "cleaning", "studyLounge"],
    nearestStation: "Sinchon (Line 2) · 4 min walk",
    photoUrls: [P.living2, P.kitchen2],
  },
  {
    id: "l-bukchon-hanok", districtId: "d-jongno", type: "sharehouse",
    title: "Bukchon Hanok Stay",
    description: "Live in a renovated traditional hanok with a courtyard, between Gyeongbokgung and Changdeokgung palaces. Modern heating, shared kitchen, and a slower pace of Seoul life.",
    addressEn: "Gahoe-dong, Jongno-gu, Seoul", lat: 37.5820, lng: 126.9845,
    amenities: ["wifi", "washer", "kitchen", "courtyard", "floorHeating"],
    nearestStation: "Anguk (Line 3) · 7 min walk",
    photoUrls: [P.house, P.living7, P.interior2],
  },
  {
    id: "l-itaewon-loft", districtId: "d-yongsan", type: "apartment",
    title: "Itaewon Hill Lofts",
    description: "Spacious one-bedroom lofts on Itaewon's hillside with city views. Walk to international restaurants, Namsan trails, and Line 6.",
    addressEn: "Itaewon-dong, Yongsan-gu, Seoul", lat: 37.5355, lng: 126.9925,
    amenities: ["wifi", "washer", "kitchen", "airConditioning", "elevator"],
    nearestStation: "Itaewon (Line 6) · 6 min walk",
    photoUrls: [P.living3, P.living6],
  },
  {
    id: "l-seongsu-coliving", districtId: "d-seongdong", type: "sharehouse",
    title: "Seongsu Co-living",
    description: "A design-forward co-living building in Seoul's 'Brooklyn'. Private rooms with shared coworking floor, gym, and monthly community dinners.",
    addressEn: "Seongsu-dong, Seongdong-gu, Seoul", lat: 37.5440, lng: 127.0560,
    amenities: ["wifi", "washer", "kitchen", "gym", "workspace", "elevator"],
    nearestStation: "Seongsu (Line 2) · 3 min walk",
    photoUrls: [P.living5, P.desk, P.kitchen2],
  },
  {
    id: "l-gangnam-residence", districtId: "d-gangnam", type: "studio",
    title: "Gangnam Station Residence",
    description: "Fully furnished officetel studios two minutes from Gangnam Station. Security desk, parcel room, and fast transit to anywhere in Seoul.",
    addressEn: "Yeoksam-dong, Gangnam-gu, Seoul", lat: 37.4985, lng: 127.0300,
    amenities: ["wifi", "washer", "airConditioning", "elevator", "security"],
    nearestStation: "Gangnam (Line 2, Shinbundang) · 2 min walk",
    photoUrls: [P.interior2, P.living4],
  },
  {
    id: "l-jamsil-lake", districtId: "d-songpa", type: "apartment",
    title: "Jamsil Lakeside Apartment",
    description: "Family-size apartment rooms near Seokchon Lake and Lotte World Tower. Quiet residential area, big supermarket nearby, and easy airport bus access.",
    addressEn: "Jamsil-dong, Songpa-gu, Seoul", lat: 37.5110, lng: 127.0980,
    amenities: ["wifi", "washer", "kitchen", "elevator", "parking"],
    nearestStation: "Jamsil (Line 2, 8) · 6 min walk",
    photoUrls: [P.living6, P.kitchen1],
  },
];

export const listings: Listing[] = listingSeeds.map(({ photoUrls, ...l }) => ({
  ...l,
  isPublished: true,
  photos: photos(l.id, l.title, photoUrls),
}));

type RoomSeed = Omit<Room, "photos" | "isPublished" | "minNights"> & { photoUrls: string[]; minNights?: number };

const roomSeeds: RoomSeed[] = [
  // Hongdae Garden House (4)
  { id: "r-hg-a", listingId: "l-hongdae-garden", name: "Room A · Sunny corner", roomType: "private", monthlyPrice: 750_000, deposit: 500_000, maintenanceFee: 80_000, maxGuests: 1, sizeM2: 11, features: ["desk", "wardrobe", "window"], photoUrls: [P.bed1, P.bed2] },
  { id: "r-hg-b", listingId: "l-hongdae-garden", name: "Room B · Private bathroom", roomType: "private", monthlyPrice: 890_000, deposit: 500_000, maintenanceFee: 80_000, maxGuests: 1, sizeM2: 13, features: ["privateBathroom", "desk", "wardrobe"], photoUrls: [P.bed3] },
  { id: "r-hg-c", listingId: "l-hongdae-garden", name: "Room C · Double bed", roomType: "private", monthlyPrice: 820_000, deposit: 500_000, maintenanceFee: 80_000, maxGuests: 2, sizeM2: 14, features: ["doubleBed", "desk"], photoUrls: [P.bed4] },
  { id: "r-hg-d", listingId: "l-hongdae-garden", name: "Shared room · Bed 1", roomType: "shared", monthlyPrice: 480_000, deposit: 300_000, maintenanceFee: 60_000, maxGuests: 1, sizeM2: 18, features: ["locker", "readingLight"], photoUrls: [P.bed5] },
  // Yeonnam Park Studios (2)
  { id: "r-yn-201", listingId: "l-yeonnam-studio", name: "Studio 201", roomType: "entire", monthlyPrice: 1_150_000, deposit: 1_000_000, maintenanceFee: 100_000, maxGuests: 1, sizeM2: 20, features: ["privateBathroom", "kitchenette", "desk"], photoUrls: [P.bed6, P.desk] },
  { id: "r-yn-302", listingId: "l-yeonnam-studio", name: "Studio 302 · Park view", roomType: "entire", monthlyPrice: 1_290_000, deposit: 1_000_000, maintenanceFee: 100_000, maxGuests: 2, sizeM2: 23, features: ["privateBathroom", "kitchenette", "parkView", "doubleBed"], photoUrls: [P.bed7] },
  // Sinchon Campus Share (3)
  { id: "r-sc-1", listingId: "l-sinchon-share", name: "Room 1", roomType: "private", monthlyPrice: 650_000, deposit: 300_000, maintenanceFee: 70_000, maxGuests: 1, sizeM2: 9, features: ["desk", "wardrobe"], photoUrls: [P.bed8] },
  { id: "r-sc-2", listingId: "l-sinchon-share", name: "Room 2 · Balcony", roomType: "private", monthlyPrice: 720_000, deposit: 300_000, maintenanceFee: 70_000, maxGuests: 1, sizeM2: 10, features: ["balcony", "desk"], photoUrls: [P.bed9] },
  { id: "r-sc-3", listingId: "l-sinchon-share", name: "Shared room · Bed 2", roomType: "shared", monthlyPrice: 450_000, deposit: 200_000, maintenanceFee: 60_000, maxGuests: 1, sizeM2: 16, features: ["locker"], photoUrls: [P.bed10] },
  // Bukchon Hanok Stay (2)
  { id: "r-bh-moon", listingId: "l-bukchon-hanok", name: "Moon Room · Courtyard view", roomType: "private", monthlyPrice: 980_000, deposit: 700_000, maintenanceFee: 90_000, maxGuests: 2, sizeM2: 12, features: ["courtyardView", "floorBed", "floorHeating"], photoUrls: [P.bed11, P.interior2], minNights: 60 },
  { id: "r-bh-pine", listingId: "l-bukchon-hanok", name: "Pine Room", roomType: "private", monthlyPrice: 920_000, deposit: 700_000, maintenanceFee: 90_000, maxGuests: 1, sizeM2: 10, features: ["floorBed", "floorHeating"], photoUrls: [P.bed2] },
  // Itaewon Hill Lofts (2)
  { id: "r-it-a", listingId: "l-itaewon-loft", name: "Loft A · City view", roomType: "entire", monthlyPrice: 2_100_000, deposit: 2_000_000, maintenanceFee: 150_000, maxGuests: 2, sizeM2: 38, features: ["privateBathroom", "fullKitchen", "cityView", "doubleBed"], photoUrls: [P.living3, P.bed3] },
  { id: "r-it-b", listingId: "l-itaewon-loft", name: "Loft B", roomType: "entire", monthlyPrice: 1_850_000, deposit: 2_000_000, maintenanceFee: 150_000, maxGuests: 2, sizeM2: 33, features: ["privateBathroom", "fullKitchen", "doubleBed"], photoUrls: [P.bed4] },
  // Seongsu Co-living (3)
  { id: "r-ss-501", listingId: "l-seongsu-coliving", name: "Room 501", roomType: "private", monthlyPrice: 870_000, deposit: 500_000, maintenanceFee: 120_000, maxGuests: 1, sizeM2: 12, features: ["privateBathroom", "desk"], photoUrls: [P.bed6] },
  { id: "r-ss-502", listingId: "l-seongsu-coliving", name: "Room 502 · Corner", roomType: "private", monthlyPrice: 940_000, deposit: 500_000, maintenanceFee: 120_000, maxGuests: 1, sizeM2: 14, features: ["privateBathroom", "desk", "window"], photoUrls: [P.bed7] },
  { id: "r-ss-601", listingId: "l-seongsu-coliving", name: "Room 601 · Double", roomType: "private", monthlyPrice: 1_050_000, deposit: 500_000, maintenanceFee: 120_000, maxGuests: 2, sizeM2: 16, features: ["privateBathroom", "doubleBed", "desk"], photoUrls: [P.bed8] },
  // Gangnam Station Residence (2)
  { id: "r-gn-1203", listingId: "l-gangnam-residence", name: "Studio 1203", roomType: "entire", monthlyPrice: 1_450_000, deposit: 1_500_000, maintenanceFee: 130_000, maxGuests: 1, sizeM2: 21, features: ["privateBathroom", "kitchenette", "desk"], photoUrls: [P.bed9] },
  { id: "r-gn-1507", listingId: "l-gangnam-residence", name: "Studio 1507 · High floor", roomType: "entire", monthlyPrice: 1_590_000, deposit: 1_500_000, maintenanceFee: 130_000, maxGuests: 2, sizeM2: 24, features: ["privateBathroom", "kitchenette", "cityView", "doubleBed"], photoUrls: [P.bed10] },
  // Jamsil Lakeside Apartment (2)
  { id: "r-js-master", listingId: "l-jamsil-lake", name: "Master bedroom", roomType: "private", monthlyPrice: 1_100_000, deposit: 1_000_000, maintenanceFee: 100_000, maxGuests: 2, sizeM2: 15, features: ["privateBathroom", "doubleBed", "wardrobe"], photoUrls: [P.bed11] },
  { id: "r-js-small", listingId: "l-jamsil-lake", name: "Small bedroom", roomType: "private", monthlyPrice: 790_000, deposit: 1_000_000, maintenanceFee: 100_000, maxGuests: 1, sizeM2: 9, features: ["desk", "wardrobe"], photoUrls: [P.bed1] },
];

export const rooms: Room[] = roomSeeds.map(({ photoUrls, minNights, ...r }) => {
  const listing = listingSeeds.find((l) => l.id === r.listingId)!;
  return {
    ...r,
    minNights: minNights ?? 30,
    isPublished: true,
    photos: photos(r.id, `${r.name}, ${listing.title}`, photoUrls),
  };
});

/** 데모용 예약 (오늘 기준 상대 날짜라 언제 열어도 달력에 보임) */
export function sampleBookings(today: string = todayInSeoul()): BookedRange[] {
  const d = (n: number) => addDaysIso(today, n);
  return [
    { roomId: "r-hg-a", checkIn: d(3), checkOut: d(63), status: "approved" },
    { roomId: "r-hg-b", checkIn: d(-20), checkOut: d(40), status: "approved" },
    { roomId: "r-sc-1", checkIn: d(10), checkOut: d(100), status: "approved" },
    { roomId: "r-bh-moon", checkIn: d(30), checkOut: d(120), status: "approved" },
    { roomId: "r-ss-501", checkIn: d(-5), checkOut: d(25), status: "approved" },
    { roomId: "r-gn-1203", checkIn: d(14), checkOut: d(74), status: "pending" },
    { roomId: "r-it-a", checkIn: d(45), checkOut: d(135), status: "approved" },
  ];
}
