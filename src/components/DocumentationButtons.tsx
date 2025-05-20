import React from 'react';

const DocumentationButtons: React.FC = () => {
  const openManual = (type: 'user' | 'programmer') => {
    const manualUrl = type === 'user' 
      ? '/downloads/Manual_Usuario_MicroCompilador.pdf' 
      : '/downloads/Manual_Programador_MicroCompilador.pdf';
    window.open(manualUrl, '_blank');
  };

  return (
    <div className="documentation-buttons d-flex gap-2 mb-3">
      <button 
        className="btn btn-primary"
        onClick={() => openManual('user')}
      >
        <i className="bi bi-person-video2 me-2"></i> Manual de Usuario
      </button>
      <button 
        className="btn btn-dark"
        onClick={() => openManual('programmer')}
      >
        <i className="bi bi-code-square me-2"></i> Manual de Programador
      </button>
    </div>
  );
};

export default DocumentationButtons;