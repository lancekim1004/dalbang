import { getRequestConfig } from "next-intl/server";

// 지금은 영어만 사용. 언어를 추가할 때 여기서 손님의 언어를 고르면 됨.
export const DEFAULT_LOCALE = "en";

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;
  return {
    locale,
    timeZone: "Asia/Seoul",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
