import { describe, expect, it } from "vitest";
import { csvCell, csvRow } from "./csv";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("menerima path internal", () => {
    expect(safeNext("/tests/numerik?x=1", "/dashboard")).toBe("/tests/numerik?x=1");
    expect(safeNext("/evil.com", "/dashboard")).toBe("/evil.com"); // path internal biasa, bukan domain
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", undefined, 123])(
    "menolak %s",
    (input) => {
      expect(safeNext(input, "/dashboard")).toBe("/dashboard");
    },
  );
});

describe("csv", () => {
  it("meng-escape koma, kutip, dan baris baru", () => {
    expect(csvCell('Budi, "Bud"')).toBe('"Budi, ""Bud"""');
    expect(csvCell("a\nb")).toBe('"a\nb"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(42)).toBe("42");
  });

  it("mencegah formula injection", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+62812")).toBe("'+62812");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("menggabungkan baris", () => {
    expect(csvRow(["a", 1, null])).toBe("a,1,");
  });
});
