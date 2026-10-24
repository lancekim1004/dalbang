// 사진 위치 → 화면용 주소. 예시 자료는 외부 주소(https://), 올린 사진은 Supabase 사진 창고.
export const PHOTO_BUCKET = "photos";

export function photoUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
