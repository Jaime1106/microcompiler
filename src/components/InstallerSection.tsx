import { FC } from "react";

const InstallerSection: FC = () => {
  return (
    <div className="bg-dark text-white p-4 rounded shadow mb-4">
      <h5><i className="bi bi-terminal"></i> Descarga de versión portable</h5>
      <p>Puedes usar el compilador sin conexión. Todos los instaladores están disponibles en Google Drive:</p>

      <div className="d-flex flex-wrap gap-2 mt-3">
        {/* Redirigir a Google Drive para macOS, Linux y Windows */}
        <a
          href="https://drive.google.com/drive/folders/1QNSDHK-mJ3F7kL0LCX278crsNm8S157W?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-light"
        >
          <i className="bi bi-apple"></i> Descargar desde Google Drive
        </a>
      </div>

      <p className="text-warning mt-3">
        ⚠️ Los instaladores están comprimidos en formato `.rar` y `.zip`. Debes descomprimirlos antes de ejecutar.
      </p>
    </div>
  );
};

export default InstallerSection;
