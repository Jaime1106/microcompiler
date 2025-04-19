import { FC } from "react";

interface CodeEditorProps {
  code: string;
  setCode: (val: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({ code, setCode }) => {
  return (
    <textarea
      className="form-control bg-black text-white p-3 rounded shadow-sm"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      style={{ minHeight: "300px", fontFamily: "monospace", fontSize: "14px" }}
    />
  );
};

export default CodeEditor;
