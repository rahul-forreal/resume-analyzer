import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import axios from "axios";

const UploadContainer = styled.div`
  padding: 40px;
`;

const ToggleGroup = styled.div`
  display: inline-flex;
  background: #edf2f7;
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
  background: ${(props) => (props.active ? "#667eea" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#4a5568")};
`;

const JobDescription = styled.textarea`
  width: 100%;
  min-height: 130px;
  border: 1px solid #d2d6dc;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
  font-family: inherit;
`;

const DropZone = styled.div`
  border: 3px dashed ${(props) => (props.isDragActive ? "#667eea" : "#e0e6ed")};
  border-radius: 15px;
  padding: 50px 40px;
  background: ${(props) => (props.isDragActive ? "#f8f9ff" : "#fafbfc")};
  cursor: pointer;
  text-align: center;
`;

function FileUpload({ onAnalysisStart, onAnalysisComplete, onError }) {
  const [mode, setMode] = useState("single");
  const [jobDescription, setJobDescription] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles.length) return onError("Please select valid PDF or DOCX resume files.");

      if (acceptedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
        return onError("Each file must be less than 5MB");
      }

      if (mode === "ranking" && acceptedFiles.length < 2) {
        return onError("Upload at least 2 resumes for ranking mode.");
      }

      onAnalysisStart();
      const formData = new FormData();

      if (mode === "single") {
        formData.append("resume", acceptedFiles[0]);
      } else {
        acceptedFiles.forEach((file) => formData.append("resumes", file));
      }

      formData.append("jobDescription", jobDescription);

      try {
        const endpoint = mode === "single" ? "/api/analyze-resume" : "/api/rank-resumes";
        const response = await axios.post(endpoint, formData, { timeout: 120000 });
        if (response.data.success) onAnalysisComplete(response.data);
        else onError(response.data.error || "Analysis failed");
      } catch (error) {
        onError(error.response?.data?.error || "Failed to process resumes. Please try again.");
      }
    },
    [mode, jobDescription, onAnalysisStart, onAnalysisComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: mode === "single" ? 1 : 10,
    multiple: mode !== "single",
  });

  return (
    <UploadContainer>
      <ToggleGroup>
        <ToggleButton active={mode === "single"} onClick={() => setMode("single")}>Single Resume Analysis</ToggleButton>
        <ToggleButton active={mode === "ranking"} onClick={() => setMode("ranking")}>Multi-Resume Ranking</ToggleButton>
      </ToggleGroup>

      <JobDescription
        placeholder="Paste Job Description (recommended for semantic matching, smart scoring, and ranking accuracy)"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <DropZone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <h3>{isDragActive ? "Drop files here" : mode === "single" ? "Upload Resume" : "Upload Multiple Resumes"}</h3>
        <p>
          {mode === "single"
            ? "Upload one PDF/DOCX file for deep analysis"
            : "Upload 2-10 PDF/DOCX files for candidate ranking"}
        </p>
      </DropZone>
    </UploadContainer>
  );
}

export default FileUpload;
