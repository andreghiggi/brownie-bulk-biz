import { describe, expect, it } from "vitest";
import { tipoDocumento } from "./documento";

describe("documento", () => {
  it("valid CPF", () => expect(tipoDocumento("529.982.247-25")).toBe("CPF"));
  it("valid CNPJ", () => expect(tipoDocumento("11.222.333/0001-81")).toBe("CNPJ"));
  it("invalid digits rejected", () => expect(tipoDocumento("11.222.333/0001-80")).toBeNull());
  it("repeated digits rejected", () => expect(tipoDocumento("111.111.111-11")).toBeNull());
});
