import React from "react";

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onClear: () => void;
  onTokens: () => void;
  onCompile: () => void;
  onExecute: () => void;
  onShowUserManual: () => void;
  onShowProgrammerManual: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNew, onOpen, onSave, onClear, onTokens, onCompile, onExecute,
  onShowUserManual, onShowProgrammerManual
}) => {
  return (
    <div className="mb-3 d-flex gap-2 flex-wrap">
      <button className="btn btn-light" onClick={onNew}>
        <i className="bi bi-file-earmark-plus"></i> Nuevo
      </button>
      <button className="btn btn-light" onClick={onOpen}>
        <i className="bi bi-folder2-open"></i> Abrir
      </button>
      <button className="btn btn-light fw-bold" onClick={onSave}>
        <i className="bi bi-save"></i> Guardar
      </button>
      <button className="btn btn-light" onClick={onClear}>
        <i className="bi bi-eraser"></i> Limpiar
      </button>
      <button className="btn btn-light" onClick={onTokens}>
        <i className="bi bi-list-ul"></i> Ver Tokens
      </button>
      <button className="btn btn-primary" onClick={onCompile}>
        <i className="bi bi-play-circle"></i> Compilar
      </button>
      <button className="btn btn-success" onClick={onExecute}>
        <i className="bi bi-play-fill"></i> Ejecutar
      </button>
      
      <button className="btn btn-info" onClick={onShowUserManual}>
        <i className="bi bi-person-video2 me-1"></i> Manual Usuario
      </button>
      <button className="btn btn-secondary" onClick={onShowProgrammerManual}>
        <i className="bi bi-code-slash me-1"></i> Manual Programador
      </button>
    </div>
  );
};

export default Toolbar;