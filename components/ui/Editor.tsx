"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

// Dynamically import ReactQuill to ensure server-side rendering compatibility
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const [editorValue, setEditorValue] = useState(value);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{ content: string }>({
    defaultValues: { content: value },
  });

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);

    if (content.trim().length === 0) {
      setError("content", { type: "required", message: "Content cannot be empty" });
    } else {
      clearErrors("content");
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"], // Remove formatting
    ],
    
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className="text-editor w-[100%]">
      <Controller
        name="content"
        control={control}
        rules={{ required: "Content cannot be empty" }} // ✅ Validation Rule Added
        render={({ field }) => (
          <ReactQuill
            theme="snow"
            value={editorValue}
            onChange={(content) => {
              field.onChange(content);
              handleChange(content);
            }}
            modules={modules}
            className="w-[100%] h-[20rem] mb-[3rem]"
            formats={formats}
          />
        )}
      />

      {/* Display Validation Error */}
      {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
    </div>
  );
};

export default TextEditor;