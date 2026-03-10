import React from "react";
import styled from "styled-components";

const Card = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
`;

function ScoreCard({ analysis }) {
  const { overallScore, breakdown } = analysis;

  return (
    <Card>
      <h3>Smart Candidate Score</h3>
      <div style={{ fontSize: 52, fontWeight: 700, color: "#2d3748" }}>{overallScore}</div>
      <p style={{ color: "#718096" }}>Composite scoring across semantic fit, impact, structure, and readability.</p>
      {Object.entries(breakdown).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>{key}</span>
            <strong>{value.score}</strong>
          </div>
          <div style={{ height: 6, background: "#edf2f7", borderRadius: 99 }}>
            <div style={{ width: `${value.score}%`, height: "100%", background: "#667eea", borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </Card>
  );
}

export default ScoreCard;
