import React, { useState } from "react";
import { Save, Copy, Trash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeFile {
  filename: string;
  content: string;
}

interface EditorProps {
  codeFiles: CodeFile[];
  onFileChange: (index: number, newContent: string) => void;
  onClearCode: (index: number) => void;
  onCopyCode: (index: number) => void;
  onSaveCode: (index: number) => void;
}

export default function Editor({
  codeFiles,
  onFileChange,
  onClearCode,
  onCopyCode,
  onSaveCode,
}: EditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  // Store the inserted text for files with TODO marker.
  const [insertedTexts, setInsertedTexts] = useState<string[]>(
    codeFiles.map(() => "")
  );

  // Handler for inserted text change when TODO marker is present.
  const handleInsertChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInsertedTexts((prev) => {
      const updated = [...prev];
      updated[activeTab] = newText;
      return updated;
    });
    // Compute combined code: replace only the first occurrence of TODO marker.
    const original = codeFiles[activeTab].content;
    const combined = original.replace(
      "// TODO: insert code",
      `// TODO: insert code\n${newText}`
    );
    onFileChange(activeTab, combined);
  };

  // Determine if the active file requires user insertion.
  const activeFile = codeFiles[activeTab];
  const hasTodo = activeFile.content.includes("// TODO: insert code");

  return (
    <div className="flex flex-col flex-1 md:w-1/2 md:border-r">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {codeFiles.map((file, index) => {
          const mark = file.content.includes("// TODO: insert code") ? (
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
        {/* Non-editable code block */}
        <div
          className="p-4 bg-muted/30 text-muted-foreground whitespace-pre overflow-x-auto"
          aria-label="Predefined code (non-editable)"
        >
          {activeFile.content}
        </div>
        {/* Conditionally display textarea if TODO marker is present */}
        {hasTodo && (
          <textarea
            className="mt-2 resize-none bg-background p-4 outline-none border rounded"
            placeholder="Insert your code here..."
            value={insertedTexts[activeTab]}
            onChange={handleInsertChange}
            spellCheck="false"
          />
        )}
      </div>
    </div>
  );
}
