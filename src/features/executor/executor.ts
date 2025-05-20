import { Token } from "../lexer/lexer";

export interface ASTNode {
    type: string;
    condition?: ASTNode;
    body?: ASTNode[];
    value?: string | number;
    left?: ASTNode;
    right?: ASTNode;
    operator?: string;
    id?: string;
    arguments?: ASTNode[];
    expression?: ASTNode;
}

export interface ExecutionState {
    pc: number;
    variables: Record<string, any>;
    output: string;
    callStack: number[];
}

interface StepResult {
    newState: ExecutionState;
    output: string;
    finished: boolean;
}

export function executeStep(state: ExecutionState, ast: ASTNode[]): StepResult {
    const currentNode = ast[state.pc];
    const newState = { ...state, pc: state.pc + 1 };

    let output = `🔹 Línea ${state.pc + 1}: ${currentNode.type}`;
    let finished = false;

    switch (currentNode.type) {
        case "while":
            if (evaluateCondition(currentNode.condition!, newState.variables)) {
                newState.callStack.push(newState.pc - 1);
            } else {
                newState.pc = findEndWhile(ast, newState.pc);
            }
            break;

        case "end-while":
            const whilePos = newState.callStack.pop();
            if (whilePos !== undefined) {
                newState.pc = whilePos;
            }
            break;

        case "assignment":
            if (currentNode.left && currentNode.right) {
                newState.variables[currentNode.left.value!] = evaluateExpression(currentNode.right, newState.variables);
                output += `\n✅ Asignado: ${currentNode.left.value} = ${newState.variables[currentNode.left.value!]}`;
            }
            break;

        case "write":
            if (currentNode.arguments) {
                const writeOutput = currentNode.arguments.map(arg => {
                    return evaluateExpression(arg, newState.variables);
                }).join(" ");
                output += `\n📝 Salida: ${writeOutput}`;
            }
            break;

        default:
            output += `\n⚠️ Instrucción no implementada: ${currentNode.type}`;
    }

    finished = newState.pc >= ast.length;
    return { newState, output, finished };
}

function evaluateCondition(condition: ASTNode, variables: Record<string, any>): boolean {
    if (condition.type === "binary") {
        const left = evaluateExpression(condition.left!, variables);
        const right = evaluateExpression(condition.right!, variables);
        
        switch (condition.operator) {
            case ">": return left > right;
            case "<": return left < right;
            case "==": return left === right;
            case "!=": return left !== right;
            case ">=": return left >= right;
            case "<=": return left <= right;
            default: return false;
        }
    }
    return false;
}

function evaluateExpression(node: ASTNode, variables: Record<string, any>): any {
    if (node.type === "number" || node.type === "literal") {
        return node.value;
    }
    if (node.type === "string") {
        return node.value?.toString().replace(/"/g, '');
    }
    if (node.type === "identifier") {
        return variables[node.id!] || 0;
    }
    if (node.type === "binary") {
        const left = evaluateExpression(node.left!, variables);
        const right = evaluateExpression(node.right!, variables);
        
        switch (node.operator) {
            case "+": return left + right;
            case "-": return left - right;
            case "*": return left * right;
            case "/": return left / right;
            default: return 0;
        }
    }
    return 0;
}

function findEndWhile(ast: ASTNode[], currentPc: number): number {
    let depth = 1;
    for (let i = currentPc + 1; i < ast.length; i++) {
        if (ast[i].type === "while") depth++;
        if (ast[i].type === "end-while") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return ast.length;
}

export function buildAST(tokens: Token[]): ASTNode[] {
    const ast: ASTNode[] = [];
    let current = 0;

    while (current < tokens.length) {
        const token = tokens[current];

        // Ignorar líneas vacías
        if (token.type === "END_LINE") {
            current++;
            continue;
        }

        // Estructura WHILE
        if (token.type === "KEYWORD" && token.value === "while") {
            const { node, newPosition } = parseWhileStatement(tokens, current);
            ast.push(node);
            current = newPosition;
            continue;
        }

        // Asignaciones de variables
        if (token.type === "IDENTIFIER" && tokens[current + 1]?.type === "ASSIGN") {
            const { node, newPosition } = parseAssignment(tokens, current);
            ast.push(node);
            current = newPosition;
            continue;
        }

        // Instrucción WRITE
        if (token.type === "KEYWORD" && token.value === "write") {
            const { node, newPosition } = parseWriteStatement(tokens, current);
            ast.push(node);
            current = newPosition;
            continue;
        }

        current++;
    }

    return ast;
}

function parseWhileStatement(tokens: Token[], start: number): { node: ASTNode; newPosition: number } {
    let current = start + 2; // Saltar 'while' y '('
    const condition = parseCondition(tokens, current);
    
    // Buscar el cierre de paréntesis
    while (current < tokens.length && tokens[current].value !== ")") {
        current++;
    }
    current++; // Saltar ')'

    const body: ASTNode[] = [];
    while (current < tokens.length && !(tokens[current].type === "KEYWORD" && tokens[current].value === "end-while")) {
        if (tokens[current].type === "IDENTIFIER" && tokens[current + 1]?.type === "ASSIGN") {
            const result = parseAssignment(tokens, current);
            body.push(result.node);
            current = result.newPosition;
        } else if (tokens[current].type === "KEYWORD" && tokens[current].value === "write") {
            const result = parseWriteStatement(tokens, current);
            body.push(result.node);
            current = result.newPosition;
        } else {
            current++;
        }
    }

    return {
        node: {
            type: "while",
            condition,
            body
        },
        newPosition: current + 1 // Saltar 'end-while'
    };
}

function parseAssignment(tokens: Token[], start: number): { node: ASTNode; newPosition: number } {
    const variableName = tokens[start].value;
    let current = start + 2; // Saltar identificador y '='
    const expression = parseExpression(tokens, current);
    
    // Buscar el final de línea
    while (current < tokens.length && tokens[current].type !== "END_LINE") {
        current++;
    }

    return {
        node: {
            type: "assignment",
            left: { type: "identifier", id: variableName },
            right: expression
        },
        newPosition: current + 1 // Saltar END_LINE
    };
}

function parseCondition(tokens: Token[], start: number): ASTNode {
    let current = start;
    const left = parseExpression(tokens, current);
    const operator = tokens[current + 1]?.value;
    current += 2;
    const right = parseExpression(tokens, current);
    
    return {
        type: "binary",
        operator,
        left,
        right
    };
}

function parseExpression(tokens: Token[], start: number): ASTNode {
    const token = tokens[start];
    
    if (token.type === "NUMBER") {
        return { type: "number", value: Number(token.value) };
    }
    if (token.type === "IDENTIFIER") {
        return { type: "identifier", id: token.value };
    }
    if (token.type === "STRING") {
        return { type: "string", value: token.value };
    }
    if (token.type === "PAREN" && token.value === "(") {
        return parseExpression(tokens, start + 1);
    }
    
    return { type: "number", value: 0 };
}

function parseWriteStatement(tokens: Token[], start: number): { node: ASTNode; newPosition: number } {
    let current = start + 2; // Saltar 'write' y '('
    const args: ASTNode[] = [];
    
    while (current < tokens.length && tokens[current].value !== ")") {
        if (tokens[current].type === "STRING") {
            args.push({ 
                type: "string", 
                value: tokens[current].value 
            });
            current++;
        } else {
            const expr = parseExpression(tokens, current);
            args.push(expr);
            current += getExpressionLength(tokens, current);
        }
        
        if (tokens[current]?.type === "COMMA") {
            current++; // Saltar coma
        }
    }
    
    return {
        node: {
            type: "write",
            arguments: args
        },
        newPosition: current + 2 // Saltar ')' y '::'
    };
}

function getExpressionLength(tokens: Token[], start: number): number {
    let length = 0;
    let parenDepth = 0;
    let current = start;
    
    while (current < tokens.length) {
        const token = tokens[current];
        
        if (token.type === "PAREN") {
            if (token.value === "(") parenDepth++;
            if (token.value === ")") parenDepth--;
        }
        
        length++;
        current++;
        
        if (parenDepth === 0 && (
            token.type === "COMMA" || 
            token.type === "END_LINE" ||
            token.value === ")"
        )) {
            break;
        }
    }
    
    return length;
}