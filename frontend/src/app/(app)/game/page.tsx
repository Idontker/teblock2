"use client";

import type React from "react";
import { useState } from "react";
import GameCanvas from "../../../components/game/GameCanvas";
import Editor from "../../../components/game/Editor";

export default function ProgrammingGame() {
  // Initial file contents based on previous code sections
  const rocketCode = `
class Rocket {
  constructor() {
    this.x = 100;
    this.y = 400;
  }

  function move () {
    // TODO: insert code
  }

  function gameLoop () {
    move();
    draw(context);
   }

  function draw (context) {

  }



  
}
`;

  const initialUser =
    "  // Write your rocket code here\n  move() {\n    // Example: Move the rocket\n    this.y -= 2;\n  }\n\n  draw(context) {\n    // Example: Draw a simple rocket\n    context.fillStyle = 'red';\n    context.fillRect(this.x, this.y, 20, 40);\n  }";
  const initialSuffix =
    "\n}\n\n// Game initialization\nconst rocket = new Rocket();\n\n// Game loop\nrocket.move();\nrocket.draw(context);";

  const [codeFiles, setCodeFiles] = useState([
    { filename: "Rocket.js", content: rocketCode },
    { filename: "code.js", content: initialUser },
    { filename: "suffix.js", content: initialSuffix },
  ]);

  const onFileChange = (index: number, newContent: string) => {
    setCodeFiles((prev) =>
      prev.map((file, idx) =>
        idx === index ? { ...file, content: newContent } : file
      )
    );
  };

  const onClearCode = (index: number) => {
    // Reset only the 'code.js' file to default; other tabs clear their content.
    if (codeFiles[index].filename === "code.js") {
      onFileChange(
        index,
        "  // Write your rocket code here\n  move() {\n    // Move the rocket\n  }\n\n  draw(context) {\n    // Draw the rocket\n  }"
      );
    } else {
      onFileChange(index, "");
    }
  };

  const onCopyCode = (index: number) => {
    navigator.clipboard.writeText(codeFiles[index].content);
  };

  const onSaveCode = (index: number) => {
    const blob = new Blob([codeFiles[index].content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = codeFiles[index].filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Prepare code for GameCanvas: use individual files
  const prefixCode =
    codeFiles.find((file) => file.filename === "prefix.js")?.content || "";
  const userCode =
    codeFiles.find((file) => file.filename === "code.js")?.content || "";
  const suffixCode =
    codeFiles.find((file) => file.filename === "suffix.js")?.content || "";

  return (
    <div className="h-screen w-screen flex flex-row ">
      {/* Updated Editor with multiple tabs */}
      <Editor
        codeFiles={codeFiles}
        onFileChange={onFileChange}
        onClearCode={onClearCode}
        onCopyCode={onCopyCode}
        onSaveCode={onSaveCode}
      />
      {/* Canvas Side */}
      <GameCanvas
        userCode={userCode}
        prefixCode={prefixCode}
        suffixCode={suffixCode}
      />
    </div>
  );
}
