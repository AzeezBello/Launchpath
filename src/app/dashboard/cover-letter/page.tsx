"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function CoverLetterPage() {
  const [savedContent, setSavedContent] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Ensure editor only mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your cover letter here...</p>",
    immediatelyRender: false, // 👈 important fix for SSR
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[200px] p-3 rounded-md border border-gray-300 focus:outline-none",
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      setSavedContent(html);
    }
  };

  if (!isMounted) return null; // 👈 prevents hydration mismatch

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Generator</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <EditorContent editor={editor} />

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={!editor}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Cover Letter
            </Button>
          </div>

          {savedContent && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📄 Preview</h2>
              <div
                className="border rounded-md p-3 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: savedContent }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
