import React from "react";
import styled from "styled-components";
import ScoreCard from "./ScoreCard";
import RecommendationsList from "./RecommendationsList";

const ResultsContainer = styled.div`
  padding: 40px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f7fafc;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #2d3748;
  margin: 0;
`;

const ResetButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a67d8;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataContainer = styled.div`
  background: #f7fafc;
  padding: 20px;
  border-radius: 12px;
  margin-top: 30px;
`;

const MetadataTitle = styled.h3`
  font-size: 1.2rem;
  color: #4a5568;
  margin: 0 0 15px 0;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const MetadataLabel = styled.span`
  color: #718096;
`;

const MetadataValue = styled.span`
  color: #2d3748;
  font-weight: 500;
`;

function AnalysisResults({ result, onReset }) {
  const { analysis, metadata } = result;

  return (
    <ResultsContainer>
      <Header>
        <Title>Resume Analysis Results</Title>
        <ResetButton onClick={onReset}>Analyze Another Resume</ResetButton>
      </Header>

      <ResultsGrid>
        <ScoreCard analysis={analysis} />
        <RecommendationsList
          recommendations={analysis.recommendations}
          strengths={analysis.strengths}
        />
      </ResultsGrid>

      <MetadataContainer>
        <MetadataTitle>Analysis Details</MetadataTitle>
        <MetadataItem>
          <MetadataLabel>File Name:</MetadataLabel>
          <MetadataValue>{metadata.filename}</MetadataValue>
        </MetadataItem>
        <MetadataItem>
          <MetadataLabel>File Size:</MetadataLabel>
          <MetadataValue>
            {(metadata.fileSize / 1024).toFixed(1)} KB
          </MetadataValue>
        </MetadataItem>
        <MetadataItem>
          <MetadataLabel>Analysis Time:</MetadataLabel>
          <MetadataValue>
            {new Date(metadata.uploadTime).toLocaleString()}
          </MetadataValue>
        </MetadataItem>
        {analysis.extractedInfo && (
          <>
            <MetadataItem>
              <MetadataLabel>Estimated Experience:</MetadataLabel>
              <MetadataValue>
                {analysis.extractedInfo.estimatedExperience}
              </MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Education Level:</MetadataLabel>
              <MetadataValue>{analysis.extractedInfo.education}</MetadataValue>
            </MetadataItem>
          </>
        )}
      </MetadataContainer>
    </ResultsContainer>
  );
}

export default AnalysisResults;
