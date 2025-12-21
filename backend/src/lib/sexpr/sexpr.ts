// backend

export type SExpr = SList | SAtom;

export type SAtom =
  | { type: "symbol"; value: string }
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "nil" };

export type SList = { type: "list"; items: SExpr[] };

export class SExprParseError extends Error {
  constructor(message: string, public readonly index?: number) {
    super(message);
    this.name = "SExprParseError";
  }
}

type Token =
  | { t: "lp"; i: number }
  | { t: "rp"; i: number }
  | { t: "str"; v: string; i: number }
  | { t: "sym"; v: string; i: number };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isWs = (c: string) => c === " " || c === "\t" || c === "\n" || c === "\r";
  const isDelim = (c: string) => isWs(c) || c === "(" || c === ")" || c === '"' || c === ";";

  while (i < input.length) {
    const c = input[i];

    if (isWs(c)) {
      i++;
      continue;
    }

    if (c === ";") {
      // comment to end of line
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }

    if (c === "(") {
      tokens.push({ t: "lp", i });
      i++;
      continue;
    }

    if (c === ")") {
      tokens.push({ t: "rp", i });
      i++;
      continue;
    }

    if (c === '"') {
      const start = i;
      i++; // skip "
      let out = "";
      while (i < input.length) {
        const ch = input[i];
        if (ch === "\\") {
          const next = input[i + 1];
          if (next === undefined) throw new SExprParseError("Unterminated string escape", i);
          if (next === "n") out += "\n";
          else if (next === "t") out += "\t";
          else if (next === "r") out += "\r";
          else out += next;
          i += 2;
          continue;
        }
        if (ch === '"') {
          i++;
          tokens.push({ t: "str", v: out, i: start });
          out = "";
          break;
        }
        out += ch;
        i++;
      }
      if (out !== "") throw new SExprParseError("Unterminated string", start);
      continue;
    }

    // symbol token
    const start = i;
    let sym = "";
    while (i < input.length && !isDelim(input[i])) {
      sym += input[i];
      i++;
    }
    if (!sym) throw new SExprParseError("Unexpected character", start);
    tokens.push({ t: "sym", v: sym, i: start });
  }

  return tokens;
}

export function parseSExpr(input: string): SExpr[] {
  const tokens = tokenize(input);
  let p = 0;

  function parseOne(): SExpr {
    const tok = tokens[p];
    if (!tok) throw new SExprParseError("Unexpected end of input");
    if (tok.t === "lp") {
      p++;
      const items: SExpr[] = [];
      while (true) {
        const next = tokens[p];
        if (!next) throw new SExprParseError("Unterminated list", tok.i);
        if (next.t === "rp") {
          p++;
          return { type: "list", items };
        }
        items.push(parseOne());
      }
    }

    if (tok.t === "rp") throw new SExprParseError("Unexpected ')'", tok.i);

    if (tok.t === "str") {
      p++;
      return { type: "string", value: tok.v };
    }

    // symbol -> coerce to number/boolean/nil when exact match
    if (tok.t === "sym") {
      p++;
      const v = tok.v;

      if (v === "nil") return { type: "nil" };
      if (v === "true") return { type: "boolean", value: true };
      if (v === "false") return { type: "boolean", value: false };

      const num = Number(v);
      if (!Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(v)) return { type: "number", value: num };

      return { type: "symbol", value: v };
    }

    throw new SExprParseError("Unknown token", (tok as any).i);
  }

  const exprs: SExpr[] = [];
  while (p < tokens.length) exprs.push(parseOne());
  return exprs;
}

export function asSymbol(x: SExpr): string | null {
  return x.type === "symbol" ? x.value : null;
}
