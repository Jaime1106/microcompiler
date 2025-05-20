import React from 'react';

interface ExecutionControlsProps {
  isExecuting: boolean;
  onNextStep: () => void;
  onStop: () => void;
}

const ExecutionControls: React.FC<ExecutionControlsProps> = ({ 
  isExecuting, onNextStep, onStop 
}) => {
  if (!isExecuting) return null;
  
  return (
    <div className="execution-controls mt-2 p-2 bg-light rounded">
      <p className="mb-1">Modo ejecución paso a paso</p>
      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-primary" onClick={onNextStep}>
          <i className="bi bi-skip-forward"></i> Siguiente paso
        </button>
        <button className="btn btn-sm btn-danger" onClick={onStop}>
          <i className="bi bi-stop-fill"></i> Detener
        </button>
      </div>
    </div>
  );
};

export default ExecutionControls;