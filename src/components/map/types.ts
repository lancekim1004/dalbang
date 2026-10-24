/** 지도에 찍을 핀 하나 = 숙소(건물) 하나 */
export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string; // 핀에 보이는 글자 (예: ₩750k)
  title: string;
  href: string;
  rooms: { name: string; price: string; href: string }[];
}
