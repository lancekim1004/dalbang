// 데이터 모양 정의. docs/PLAN.md 3장의 데이터베이스 표와 1:1로 맞춤.

export type ListingType = "sharehouse" | "studio" | "apartment";
export type RoomType = "private" | "shared" | "entire";
export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired"
  | "awaiting_payment" // 결제 도입 시 사용
  | "paid"; // 결제 도입 시 사용

export interface District {
  id: string;
  slug: string;
  nameEn: string;
  sortOrder: number;
}

export interface Photo {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface Listing {
  id: string;
  districtId: string;
  type: ListingType;
  title: string;
  description: string;
  addressEn: string;
  lat: number;
  lng: number;
  amenities: string[];
  nearestStation: string;
  isPublished: boolean;
  photos: Photo[];
}

export interface Room {
  id: string;
  listingId: string;
  name: string;
  roomType: RoomType;
  monthlyPrice: number; // 원(KRW) 정수
  deposit: number;
  maintenanceFee: number; // 월 관리비
  minNights: number; // 30 이상
  maxGuests: number;
  sizeM2: number;
  features: string[];
  isPublished: boolean;
  photos: Photo[];
}

/** 날짜 겹침 계산에 필요한 예약 정보만 (손님 개인정보 없음) */
export interface BookedRange {
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD (이 날 밤은 숙박에 포함 안 됨)
  status: BookingStatus;
}

/** 화면에 보여줄 때 쓰는, 숙소·지역 정보가 붙은 방 */
export interface RoomWithListing extends Room {
  listing: Listing;
  district: District;
}
