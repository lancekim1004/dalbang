import { describe, expect, it } from "vitest";
import { calcPrice, splitStay } from "./pricing";

const room = { monthlyPrice: 900_000, deposit: 500_000, maintenanceFee: 100_000 };

describe("splitStay — 개월 수와 남는 날", () => {
  it("3/15 → 4/15 는 1개월", () => {
    expect(splitStay("2027-03-15", "2027-04-15")).toEqual({ nights: 31, months: 1, extraDays: 0 });
  });
  it("3/15 → 5/20 는 2개월 + 5일 (66박)", () => {
    expect(splitStay("2027-03-15", "2027-05-20")).toEqual({ nights: 66, months: 2, extraDays: 5 });
  });
  it("1/31 → 2/28 (평년)은 그 달 마지막 날로 맞춰 1개월", () => {
    expect(splitStay("2027-01-31", "2027-02-28")).toEqual({ nights: 28, months: 1, extraDays: 0 });
  });
  it("1/31 → 3/2 (평년, 30박) 은 1개월 + 2일", () => {
    expect(splitStay("2027-01-31", "2027-03-02")).toEqual({ nights: 30, months: 1, extraDays: 2 });
  });
  it("윤년 1/31 → 2/29 는 1개월", () => {
    expect(splitStay("2028-01-31", "2028-02-29")).toEqual({ nights: 29, months: 1, extraDays: 0 });
  });
  it("1/31 → 3/31 는 2개월 (중간 달 끝에 끌려가지 않음)", () => {
    expect(splitStay("2027-01-31", "2027-03-31")).toEqual({ nights: 59, months: 2, extraDays: 0 });
  });
  it("30박이지만 1개월이 안 되는 경우 (4/1 → 5/1 은 30박 = 1개월)", () => {
    expect(splitStay("2027-04-01", "2027-05-01")).toEqual({ nights: 30, months: 1, extraDays: 0 });
  });
  it("12개월 꽉 채움", () => {
    expect(splitStay("2027-03-01", "2028-03-01")).toMatchObject({ months: 12, extraDays: 0 });
  });
  it("퇴실일이 입주일보다 빠르면 오류", () => {
    expect(() => splitStay("2027-03-15", "2027-03-15")).toThrow();
  });
});

describe("calcPrice — 총액", () => {
  it("기획서 예시: 3/15 → 5/20 = 2,650,000원", () => {
    const p = calcPrice(room, "2027-03-15", "2027-05-20");
    expect(p).toMatchObject({
      dailyRate: 30_000,
      rentForMonths: 1_800_000,
      rentForExtraDays: 150_000,
      maintenanceTotal: 200_000,
      deposit: 500_000,
      total: 2_650_000,
    });
  });
  it("딱 1개월이면 남는 날 금액 0", () => {
    expect(calcPrice(room, "2027-03-15", "2027-04-15").total).toBe(900_000 + 100_000 + 500_000);
  });
  it("하루 가격은 원 단위 반올림 (월 650,000 → 21,667)", () => {
    const p = calcPrice({ monthlyPrice: 650_000, deposit: 0, maintenanceFee: 0 }, "2027-03-01", "2027-04-04");
    expect(p.dailyRate).toBe(21_667);
    expect(p.total).toBe(650_000 + 21_667 * 3);
  });
  it("모든 금액은 정수", () => {
    const p = calcPrice({ monthlyPrice: 777_777, deposit: 333_333, maintenanceFee: 55_555 }, "2027-01-31", "2027-04-13");
    for (const v of Object.values(p)) expect(Number.isInteger(v)).toBe(true);
  });
});
