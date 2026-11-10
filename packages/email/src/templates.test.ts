import { describe, expect, it } from "vitest";
import { adminCompletedTemplate, escapeHtml, verifyEmailTemplate } from "./templates";

describe("email templates", () => {
  it("meng-escape input pengguna", () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
    const mail = adminCompletedTemplate({ userName: "<b>Budi</b>", userEmail: "b@x.id", url: "https://x.id" });
    expect(mail.html).not.toContain("<b>Budi</b>");
    expect(mail.html).toContain("&lt;b&gt;Budi&lt;/b&gt;");
  });

  it("menyertakan tautan di versi html & teks", () => {
    const url = "https://app.example.com/verify-email?token=abc";
    const mail = verifyEmailTemplate({ name: "Sari", url });
    expect(mail.html).toContain(url);
    expect(mail.text).toContain(url);
    expect(mail.subject).toMatch(/Verifikasi/);
  });
});
