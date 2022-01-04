import {
  clamp,
  cube,
  differenceDegrees,
  sanitizeDegrees,
  square,
  toDegrees,
  toRadians,
} from "../../math"

describe("test math", () => {
  it("cube should return the triple of value", () => {
    expect(cube(2)).toBe(8)
  })

  it("square should return the double of value", () => {
    expect(square(2)).toBe(4)
  })

  it("clamp should return value in [min, max]", () => {
    expect(clamp(0, 2, 3)).toBe(2)
    expect(clamp(0, 2, 1)).toBe(1)
    expect(clamp(0, -2, 1)).toBe(0)
  })

  it("toRadians should convert degrees to radians", () => {
    expect(toRadians(30)).toBe((30 * Math.PI) / 180)
  })

  it("toDegrees should convert radians to degrees", () => {
    expect(toDegrees(30)).toBe((30 * 180) / Math.PI)
  })

  it("sanitizeDegrees should return value in [0, 360)", () => {
    expect(sanitizeDegrees(30)).toBe(30)
    expect(sanitizeDegrees(360)).toBe(0)
    expect(sanitizeDegrees(-60)).toBe(300)
    expect(sanitizeDegrees(400)).toBe(40)
  })

  it("differenceDegrees should return shortest angle between two angles", () => {
    expect(differenceDegrees(30, 60)).toBe(30)
    expect(differenceDegrees(60, 30)).toBe(30)
  })
})
