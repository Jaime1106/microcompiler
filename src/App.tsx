import { useState } from "react";
import Toolbar from "./components/Toolbar";
import CodeEditor from "./components/CodeEditor";
import ConsoleOutput from "./components/ConsoleOutput";
import InstallerSection from "./components/InstallerSection";
import { tokenize } from "./features/lexer/lexer";
import { parse } from "./features/parser/parser";
import "./styles/global.css";

function App() {
  const [code, setCode] = useState("// Escribe tu código aquí...");
  const [output, setOutput] = useState("💬 Esperando compilación...");

  const handleNew = () => {
    setCode("// Escribe tu código aquí...");
    setOutput("💬 Nuevo archivo creado.");
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
