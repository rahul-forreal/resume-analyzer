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
`;

const ResetButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
`;

const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  td,
  th {
    border-bottom: 1px solid #edf2f7;
    padding: 10px;
    text-align: left;
  }
`;

function AnalysisResults({ result, onReset }) {
  if (result.mode === "ranking") {
    return (
      <ResultsContainer>
        <Header>
          <h2>Multi-Resume Ranking Results</h2>
          <ResetButton onClick={onReset}>Analyze Again</ResetButton>
        </Header>

        <RankingTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate File</th>
              <th>Smart Score</th>
              <th>Semantic Match</th>
            </tr>
          </thead>
          <tbody>
            {result.ranking.map((candidate) => (
              <tr key={candidate.filename}>
                <td>#{candidate.rank}</td>
                <td>{candidate.filename}</td>
                <td>{candidate.candidateScore}</td>
                <td>{candidate.analysis.breakdown.semanticMatch.score}</td>
              </tr>
            ))}
          </tbody>
        </RankingTable>

        <p style={{ marginTop: "16px", color: "#4a5568" }}>
          Average score: <strong>{result.insights.avgScore}</strong> • Spread: <strong>{result.insights.scoreSpread}</strong>
        </p>
      </ResultsContainer>
    );
  }

  const { analysis, metadata } = result;

  return (
    <ResultsContainer>
      <Header>
        <h2>AI Resume Analysis Results</h2>
        <ResetButton onClick={onReset}>Analyze Another Resume</ResetButton>
      </Header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        <ScoreCard analysis={analysis} />
        <RecommendationsList recommendations={analysis.recommendations} strengths={analysis.strengths} />
      </div>

      {analysis.llmFeedback && (
        <div style={{ marginTop: 24, background: "#f8fafc", borderRadius: 12, padding: 20 }}>
          <h3>LLM Resume Feedback ({analysis.llmFeedback.provider})</h3>
          <p>{analysis.llmFeedback.summary}</p>
          <ul>
            {(analysis.llmFeedback.bulletFeedback || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <p><strong>File:</strong> {metadata.filename}</p>
        <p><strong>Experience:</strong> {analysis.extractedInfo.estimatedExperience}</p>
        <p><strong>Top Skills:</strong> {(analysis.extractedInfo.topSkills || []).join(", ") || "N/A"}</p>
      </div>
    </ResultsContainer>
  );
}

export default AnalysisResults;
