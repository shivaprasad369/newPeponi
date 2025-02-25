import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function FileDropzone({setFiles,files,setNewFiles,newFiles,handleDeleteImages}) {

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: true
  });

  const removeFile = (name) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag & drop multiple images here, or click to select</p>
        )}
      </div>
      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {files.map((file) => (
          <div key={file.name} style={{ position: "relative" }}>
            <button
              onClick={() => removeFile(file.name)}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
              className="flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={file.preview}
              alt={file.name}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            {/* <p style={{ fontSize: "12px", marginTop: "4px" }}>{file.name}</p> */}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {newFiles?.map((file) => (
          <div key={file.ImageID} style={{ position: "relative" }}>
            <div
              onClick={() => handleDeleteImages(file.ImageID,file.ImageURL)}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
              className="flex items-center text-center justify-center"
            >
              ×
            </div>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${file.ImageURL}`}
              alt={"Product Images"}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            {/* <p style={{ fontSize: "12px", marginTop: "4px" }}>{file.name}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}
