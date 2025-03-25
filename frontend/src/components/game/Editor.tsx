import React, { useState, useEffect } from "react";
import { Save, Copy, Trash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeFile {
  filename: string;
  content: string; // original (display) content
}

interface EditorProps {
  codeFiles: CodeFile[];
  onFileChange: (index: number, newContent: string) => void;
  onCombinedChange: (index: number, combined: string) => void;
  onClearCode: (index: number) => void;
  onCopyCode: (index: number) => void;
  onSaveCode: (index: number) => void;
}

export default function Editor({
  codeFiles,
  onFileChange,
  onCombinedChange,
  onClearCode,
  onCopyCode,
  onSaveCode,
}: EditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  // For each file, store an array of inserted texts – one per TODO segment.
  // Structure: { [activeTab]: string[] }
  const [insertedTexts, setInsertedTexts] = useState<Record<number, string[]>>(
    {}
  );

  const todoMarker = "// TODO: insert code";
  const activeFile = codeFiles[activeTab];

  // Split the file line-by-line so that each line containing the TODO marker is kept
  // in the preceding segment.
  const lines = activeFile.content.split("\n");
  const segments: string[] = [];
  let currentSegment = "";
  for (let i = 0; i < lines.length; i++) {
    currentSegment += lines[i] + "\n";
    if (lines[i].includes(todoMarker)) {
      segments.push(currentSegment);
      currentSegment = "";
    }
  }
  // Push any remaining lines.
  segments.push(currentSegment);
  const todoCount = segments.length - 1; // each TODO marker gets its own textarea

  // Initialize insertedTexts for the active file if needed.
  useEffect(() => {
    setInsertedTexts((prev) => {
      if (!(activeTab in prev) || prev[activeTab].length !== todoCount) {
        return { ...prev, [activeTab]: Array(todoCount).fill("") };
      }
      return prev;
    });
  }, [activeTab, todoCount]);

  const currentTodos = insertedTexts[activeTab] || Array(todoCount).fill("");

  const handleTodoChange = (
    idx: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newText = e.target.value;
    setInsertedTexts((prev) => {
      const updated = { ...prev };
      updated[activeTab] = (
        updated[activeTab] || Array(todoCount).fill("")
      ).map((t, i) => (i === idx ? newText : t));
      return updated;
    });
    // Compute the combined string from segments and inserted texts.
    const updatedTodos = currentTodos.map((t, i) => (i === idx ? newText : t));
    let combined = segments[0];
    for (let i = 0; i < todoCount; i++) {
      combined += updatedTodos[i] + segments[i + 1];
    }
    onCombinedChange(activeTab, combined);
  };

  return (
    <div className="flex flex-col flex-1 md:w-1/2 md:border-r">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {codeFiles.map((file, index) => {
          const mark = file.content.includes(todoMarker) ? (
            <AlertCircle size={16} className="ml-1 text-yellow-700" />
          ) : null;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex flex-row gap-2 items-center px-4 py-2 border-b-2 ${
                activeTab === index ? "border-primary" : "border-transparent"
              }`}
            >
              {mark}
              {file.filename}
            </button>
          );
        })}
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-b p-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSaveCode(activeTab)}
          title="Save Code"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onCopyCode(activeTab)}
          title="Copy Code"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onClearCode(activeTab)}
          title="Clear Code"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      {/* Code Display Area */}
      <div className="flex-1 flex flex-col font-mono text-sm bg-background overflow-hidden">
        {/* Render segments and textareas in alternating order */}
        <div
          className="p-4 bg-muted/30 text-muted-foreground whitespace-pre overflow-x-auto"
          aria-label="Predefined code (non-editable)"
        >
          {segments[0]}
        </div>
        {Array.from({ length: todoCount }).map((_, idx) => (
          <React.Fragment key={idx}>
            <textarea
              className="mt-2 resize-none bg-background p-4 outline-none border rounded"
              placeholder={`Insert code for TODO #${idx + 1}...`}
              value={currentTodos[idx]}
              onChange={(e) => handleTodoChange(idx, e)}
              spellCheck="false"
            />
            <div
              className="mt-2 p-4 bg-muted/30 text-muted-foreground whitespace-pre overflow-x-auto"
              aria-label="Predefined code (non-editable)"
            >
              {segments[idx + 1]}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
