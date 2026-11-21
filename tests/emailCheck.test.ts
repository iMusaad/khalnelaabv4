import { describe, expect, it } from "vitest";
import { emailProblem, suggestion } from "@/lib/emailCheck";

describe("buy form email checks", () => {
  it("accepts a valid email with spaces around it", () => {
    expect(emailProblem(" Ahmad@Gmail.com ")).toBe("");
  });

  it("rejects an invalid email", () => {
    expect(emailProblem("ahmad")).not.toBe("");
    expect(emailProblem("a@b")).not.toBe("");
  });

  it("suggests fixes for common domain typos", () => {
    expect(suggestion("ahmad@gmial.com")).toBe("ahmad@gmail.com");
    expect(suggestion("ahmad@hotmail.con")).toBe("ahmad@hotmail.com");
    expect(suggestion("ahmad@gmail.com")).toBeNull();
    expect(suggestion("ahmad")).toBeNull();
  });
});
