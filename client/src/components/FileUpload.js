import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import axios from "axios";

const UploadContainer = styled.div`
  padding: 60px 40px;
  text-align: center;
`;

const DropZone = styled.div`
  border: 3px dashed ${(props) => (props.isDragActive ? "#667eea" : "#e0e6ed")};
  border-radius: 15px;
  padding: 60px 40px;
  background: ${(props) => (props.isDragActive ? "#f8f9ff" : "#fafbfc")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 20px;
`;

const UploadTitle = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 10px 0;
`;

const UploadSubtitle = styled.p`
  font-size: 1rem;
  color: #718096;
  margin: 0 0 20px 0;
`;

const FileInfo = styled.div`
  font-size: 0.9rem;
  color: #a0aec0;
`;

function FileUpload({ onAnalysisStart, onAnalysisComplete, onError }) {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        onError("Please select a valid PDF or DOCX file");
        return;
      }

      const file = acceptedFiles[0];

      if (file.size > 5 * 1024 * 1024) {
        onError("File size must be less than 5MB");
        return;
      }

      onAnalysisStart();

      const formData = new FormData();
      formData.append("resume", file);

      try {
        const response = await axios.post("/api/analyze-resume", formData, {
          // headers: {
          //   "Content-Type": "multipart/form-data",
          // },
          timeout: 60000, // 60 seconds timeout
        });

        if (response.data.success) {
          onAnalysisComplete(response.data);
        } else {
          onError(response.data.error || "Analysis failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (error.code === "ECONNABORTED") {
          onError("Analysis timed out. Please try again.");
        } else if (error.response?.data?.error) {
          onError(error.response.data.error);
        } else {
          onError(
            "Failed to analyze resume. Please check your connection and try again."
          );
        }
      }
    },
    [onAnalysisStart, onAnalysisComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <UploadContainer>
      <DropZone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <UploadIcon>📄</UploadIcon>
        <UploadTitle>
          {isDragActive ? "Drop your resume here" : "Upload Your Resume"}
        </UploadTitle>
        <UploadSubtitle>
          {isDragActive
            ? "Release to analyze your resume"
            : "Drag & drop your resume here, or click to select"}
        </UploadSubtitle>
        <FileInfo>Supports PDF and DOCX files • Maximum 5MB</FileInfo>
      </DropZone>
    </UploadContainer>
  );
}

export default FileUpload;
