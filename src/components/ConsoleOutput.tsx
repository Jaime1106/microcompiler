import { FC } from "react";

interface OutputProps {
  output: string;
}

const ConsoleOutput: FC<OutputProps> = ({ output }) => {
  return (
    <pre className="bg-black text-white p-3 rounded shadow-sm" style={{ minHeight: "300px" }}>
      {output}
    </pre>
  );
};

export default ConsoleOutput;
