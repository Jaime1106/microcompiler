export type TokenType =
  | "KEYWORD"
  | "IDENTIFIER"
  | "NUMBER"
  | "OPERATOR"
  | "REL_OPERATOR"
  | "LOGIC_OPERATOR"
  | "PAREN"
  | "COMMA"
  | "STRING"
  | "END_LINE"
  | "ASSIGN"
  | "UNKNOWN";

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

const keywords = ["if", "then", "end-if", "write", "capture"];
const logicOps = ["and", "or", "not"];
const relOps = ["<", ">", "<=", ">=", "<>", "="];
const arithOps = ["+", "-", "*", "/"];

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /::|"[^"]*"|\d+(\.\d+)?|<=|>=|<>|<|>|=|\+|\-|\*|\/|[a-zA-Z_]\w*|[(),]/g;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(input)) !== null) {
    const value = match[0];
    let type: TokenType = "UNKNOWN";

    if (value === "::") {
      type = "END_LINE";
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      type = "NUMBER";
    } else if (/^"[^"]*"$/.test(value)) {
      type = "STRING";
    } else if (value === "," || value === "(" || value === ")") {
      type = "PAREN";
      if (value === ",") type = "COMMA";
    } else if (logicOps.includes(value)) {
      type = "LOGIC_OPERATOR";
    } else if (relOps.includes(value)) {
      type = value === "=" ? "ASSIGN" : "REL_OPERATOR";
    } else if (arithOps.includes(value)) {
      type = "OPERATOR";
    } else if (keywords.includes(value)) {
      type = "KEYWORD";
    } else if (/^[a-zA-Z_]\w*$/.test(value)) {
      type = "IDENTIFIER";
    }

    tokens.push({ type, value, position: match.index });
    index++;
  }

  return tokens;
}
