import { describe, expect, it } from "vitest";
import { emailProblem, suggestion } from "@/lib/emailCheck";

describe("buy form email checks", () => {
  it("accepts matching emails regardless of case and spaces", () => {
    expect(emailProblem("Ahmad@Gmail.com ", " ahmad@gmail.com")).toBe("");
  });

  it("rejects invalid or mismatched emails", () => {
    expect(emailProblem("ahmad", "ahmad")).not.toBe("");
    expect(emailProblem("a@b.co", "a@b.com")).not.toBe("");
  });

  it("suggests fixes for common domain typos", () => {
    expect(suggestion("ahmad@gmial.com")).toBe("ahmad@gmail.com");
    expect(suggestion("ahmad@hotmail.con")).toBe("ahmad@hotmail.com");
    expect(suggestion("ahmad@gmail.com")).toBeNull();
    expect(suggestion("ahmad")).toBeNull();
  });
});
