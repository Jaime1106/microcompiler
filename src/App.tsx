import { useState } from "react";
import Toolbar from "./components/Toolbar";
import CodeEditor from "./components/CodeEditor";
import ConsoleOutput from "./components/ConsoleOutput";
import InstallerSection from "./components/InstallerSection";
import ExecutionControls from "./components/ExecutionControls";
import { tokenize } from "./features/lexer/lexer";
import { parse } from "./features/parser/parser";
import { buildAST, executeStep, ExecutionState } from "./features/executor/executor";
import "./styles/global.css";

function App() {
  const [code, setCode] = useState("// Escribe tu código aquí...");
  const [output, setOutput] = useState("💬 Esperando compilación...");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [ast, setAst] = useState<any[]>([]);

  const handleNew = () => {
    setCode("// Escribe tu código aquí...");
    setOutput("💬 Nuevo archivo creado.");
    setIsExecuting(false);
  };

  const handleOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result?.toString() || "";
        setCode(content);
        setOutput("📂 Archivo abierto exitosamente.");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "codigo.txt";
    link.click();
    setOutput("💾 Código guardado como archivo .txt");
  };

  const handleClear = () => {
    setCode("// Escribe tu código aquí...");
    setOutput("🧹 Editor limpio.");
    setIsExecuting(false);
  };

  const handleTokens = () => {
    const tokens = tokenize(code);
    const tokenList = tokens
      .map((t) => `[${t.type}] "${t.value}" @${t.position}`)
      .join("\n");
    setOutput(`🔍 Tokens encontrados: ${tokens.length}\n\n${tokenList}`);
  };

  const handleCompile = () => {
    const tokens = tokenize(code);
    const result = parse(tokens);
    if (result.success) {
      setOutput("✅ Compilación exitosa");
    } else {
      setOutput("❌ Errores encontrados:\n\n" + result.errors.join("\n"));
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setOutput("🚀 Iniciando ejecución...");
    
    const tokens = tokenize(code);
    const parseResult = parse(tokens);
    
    if (!parseResult.success) {
      setOutput("❌ Errores encontrados:\n\n" + parseResult.errors.join("\n"));
      setIsExecuting(false);
      return;
    }
    
    const newAST = buildAST(tokens);
    setAst(newAST);
    
    const initialState: ExecutionState = {
      pc: 0,
      variables: {},
      output: "",
      callStack: []
    };
    
    setExecutionState(initialState);
    setOutput("✅ Compilación exitosa\n🚀 Preparado para ejecución paso a paso");
  };

  const handleNextStep = () => {
    if (!executionState || !ast) return;
    
    const result = executeStep(executionState, ast);
    setExecutionState(result.newState);
    setOutput(prev => prev + "\n" + result.output);
    
    if (result.finished) {
      setIsExecuting(false);
      setOutput(prev => prev + "\n✅ Ejecución completada");
    }
  };

  const handleStopExecution = () => {
    setIsExecuting(false);
    setOutput(prev => prev + "\n⏹ Ejecución detenida por el usuario");
  };

  const handleShowUserManual = () => {
    window.open('/downloads/Manual_Usuario_MicroCompilador.pdf', '_blank');
  };

  const handleShowProgrammerManual = () => {
    window.open('/downloads/Manual_Programador_MicroCompilador.pdf', '_blank');
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">💻 Micro-Compilador Web</h1>

      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onClear={handleClear}
        onTokens={handleTokens}
        onCompile={handleCompile}
        onExecute={handleExecute}
        onShowUserManual={handleShowUserManual}
        onShowProgrammerManual={handleShowProgrammerManual}
      />

      <ExecutionControls 
        isExecuting={isExecuting}
        onNextStep={handleNextStep}
        onStop={handleStopExecution}
      />

      <InstallerSection />

      <div className="row mt-4">
        <div className="col-md-6">
          <h5><i className="bi bi-pencil-square"></i> Editor</h5>
          <CodeEditor code={code} setCode={setCode} />
        </div>
        <div className="col-md-6">
          <h5><i className="bi bi-terminal"></i> Consola</h5>
          <ConsoleOutput output={output} />
        </div>
      </div>
    </div>
  );
}

export default App;