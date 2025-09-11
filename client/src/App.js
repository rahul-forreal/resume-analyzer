import React, { useState } from "react";
import styled from "styled-components";
import FileUpload from "./components/FileUpload";
import AnalysisResults from "./components/AnalysisResults";
import Header from "./components/Header";
import "./App.css";

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: "Inter", sans-serif;
`;

const MainContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
`;

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setError(null);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <AppContainer>
      <MainContainer>
        <Header />
        <ContentContainer>
          {!analysisResult && !isLoading && (
            <FileUpload
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
            />
          )}

          {isLoading && (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div className="loading-spinner"></div>
              <h3>Analyzing your resume...</h3>
              <p>This may take a few moments</p>
            </div>
          )}

          {error && (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div className="error-message">
                <h3>Analysis Failed</h3>
                <p>{error}</p>
                <button onClick={handleReset} className="retry-button">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {analysisResult && (
            <AnalysisResults result={analysisResult} onReset={handleReset} />
          )}
        </ContentContainer>
      </MainContainer>
    </AppContainer>
  );
}

export default App;
