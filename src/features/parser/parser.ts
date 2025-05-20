import { Token } from "../lexer/lexer";

export interface ParseResult {
  success: boolean;
  errors: string[];
}

export function parse(tokens: Token[]): ParseResult {
  const errors: string[] = [];
  const stack: string[] = [];
  let i = 0;

  const next = () => tokens[i++];
  const peek = () => tokens[i];
  const expect = (type: string, value?: string) => {
    const token = peek();
    if (!token || token.type !== type || (value && token.value !== value)) {
      errors.push(`Error de sintaxis cerca de "${token?.value ?? "fin"}"`);
      return false;
    }
    next();
    return true;
  };

  while (i < tokens.length) {
    const token = next();

    if (token.type === "KEYWORD" && token.value === "if") {
      if (!expect("PAREN", "(")) continue;

      let openParens = 1;
      while (peek() && openParens > 0) {
        const current = peek();

        if (current.type === "PAREN") {
          if (current.value === "(") openParens++;
          if (current.value === ")") openParens--;
          next();
        } else if (
          current.type === "NUMBER" ||
          current.type === "IDENTIFIER" ||
          current.type === "REL_OPERATOR" ||
          current.type === "LOGIC_OPERATOR"
        ) {
          next();
        } else {
          errors.push(`Token inesperado en condición: ${current.value}`);
          next();
        }
      }

      if (openParens !== 0) {
        errors.push("Condición del if mal formada: paréntesis no balanceados");
        continue;
      }

      if (!expect("KEYWORD", "then")) continue;
      stack.push("if");

    } else if (token.type === "KEYWORD" && token.value === "while") {
      if (!expect("PAREN", "(")) continue;

      let openParens = 1;
      while (peek() && openParens > 0) {
        const current = peek();
        if (current.type === "PAREN") {
          if (current.value === "(") openParens++;
          if (current.value === ")") openParens--;
          next();
        } else if (
          current.type === "NUMBER" ||
          current.type === "IDENTIFIER" ||
          current.type === "REL_OPERATOR" ||
          current.type === "LOGIC_OPERATOR"
        ) {
          next();
        } else {
          errors.push(`Token inesperado en condición while: ${current.value}`);
          next();
        }
      }

      if (openParens !== 0) {
        errors.push("Condición del while mal formada: paréntesis no balanceados");
        continue;
      }

      stack.push("while");

    } else if (token.type === "KEYWORD" && token.value === "end-if") {
      if (stack.length === 0 || stack.pop() !== "if") {
        errors.push("end-if sin if correspondiente");
      }

    } else if (token.type === "KEYWORD" && token.value === "end-while") {
      if (stack.length === 0 || stack.pop() !== "while") {
        errors.push("end-while sin while correspondiente");
      }

    } else if (token.type === "KEYWORD" && token.value === "write") {
      if (!expect("PAREN", "(")) continue;

      if (!expect("STRING")) continue;

      if (peek() && peek().type === "COMMA") {
        next(); // consume la coma

        let openParens = 0;
        while (peek() && peek().value !== ")") {
          const current = next();
          if (current.type === "PAREN") {
            if (current.value === "(") openParens++;
            if (current.value === ")") openParens--;
          } else if (
            current.type !== "NUMBER" &&
            current.type !== "IDENTIFIER" &&
            current.type !== "OPERATOR"
          ) {
            errors.push(`Token inesperado en write: ${current.value}`);
          }
        }
      }

      if (!expect("PAREN", ")")) {
        errors.push('Falta ")" en instrucción write');
        continue;
      }

      if (!expect("END_LINE")) {
        errors.push("write debe terminar con '::'");
      }

    } else if (token.type === "KEYWORD" && token.value === "capture") {
      if (!expect("PAREN", "(")) continue;
      if (!expect("IDENTIFIER")) continue;
      if (!expect("PAREN", ")")) continue;
      if (!expect("END_LINE")) {
        errors.push("capture debe terminar con '::'");
      }

    } else if (token.type === "IDENTIFIER") {
      if (!expect("ASSIGN")) continue;

      let openParens = 0;
      while (peek() && peek().type !== "END_LINE") {
        const current = next();
        if (current.type === "PAREN") {
          if (current.value === "(") openParens++;
          if (current.value === ")") openParens--;
          if (openParens < 0) {
            errors.push("Paréntesis de cierre ')' sin apertura");
            break;
          }
        } else if (
          current.type !== "NUMBER" &&
          current.type !== "IDENTIFIER" &&
          current.type !== "OPERATOR"
        ) {
          errors.push(`Token inesperado en asignación: ${current.value}`);
        }
      }

      if (openParens > 0) {
        errors.push("Faltan paréntesis de cierre ')'");
      }

      if (!expect("END_LINE")) {
        errors.push("Falta '::' al final de la asignación");
      }

    } else if (token.type === "END_LINE") {
      continue;

    } else {
      errors.push(`Token inesperado: ${token.value}`);
    }
  }

  if (stack.length > 0) {
    const unclosedBlock = stack[stack.length - 1];
    errors.push(`Falta cerrar un bloque ${unclosedBlock} con end-${unclosedBlock}`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}