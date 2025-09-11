import React from "react";
import styled from "styled-components";

const ScoreContainer = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    if (props.score >= 80) return "linear-gradient(135deg, #48bb78, #38a169)";
    if (props.score >= 60) return "linear-gradient(135deg, #ed8936, #dd6b20)";
    return "linear-gradient(135deg, #f56565, #e53e3e)";
  }};
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ScoreTitle = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 20px 0;
`;

const ScoreDescription = styled.p`
  color: #718096;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const BreakdownContainer = styled.div`
  text-align: left;
`;

const BreakdownTitle = styled.h4`
  font-size: 1.2rem;
  color: #4a5568;
  margin: 0 0 15px 0;
  text-align: center;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
`;

const BreakdownLabel = styled.span`
  color: #4a5568;
  font-size: 0.9rem;
`;

const BreakdownScore = styled.span`
  font-weight: 600;
  color: ${(props) => {
    if (props.score >= 80) return "#38a169";
    if (props.score >= 60) return "#dd6b20";
    return "#e53e3e";
  }};
`;

const BreakdownBar = styled.div`
  width: 60px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 10px;
`;

const BreakdownProgress = styled.div`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background: ${(props) => {
    if (props.score >= 80) return "#38a169";
    if (props.score >= 60) return "#dd6b20";
    return "#e53e3e";
  }};
  transition: width 0.5s ease-out;
`;

function ScoreCard({ analysis }) {
  const { overallScore, breakdown } = analysis;

  const getScoreDescription = (score) => {
    if (score >= 80)
      return "Excellent! Your resume is well-optimized for ATS systems.";
    if (score >= 60)
      return "Good! Your resume has solid ATS compatibility with room for improvement.";
    return "Needs improvement. Follow our recommendations to optimize for ATS systems.";
  };

  return (
    <ScoreContainer>
      <ScoreCircle score={overallScore}>{overallScore}</ScoreCircle>

      <ScoreTitle>ATS Compatibility Score</ScoreTitle>
      <ScoreDescription>{getScoreDescription(overallScore)}</ScoreDescription>

      <BreakdownContainer>
        <BreakdownTitle>Score Breakdown</BreakdownTitle>

        {Object.entries(breakdown).map(([key, data]) => (
          <BreakdownItem key={key}>
            <BreakdownLabel>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </BreakdownLabel>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BreakdownScore score={(data.score / getMaxScore(key)) * 100}>
                {data.score}
              </BreakdownScore>
              <BreakdownBar>
                <BreakdownProgress
                  percentage={(data.score / getMaxScore(key)) * 100}
                  score={(data.score / getMaxScore(key)) * 100}
                />
              </BreakdownBar>
            </div>
          </BreakdownItem>
        ))}
      </BreakdownContainer>
    </ScoreContainer>
  );
}

function getMaxScore(category) {
  const maxScores = {
    keywordMatching: 25,
    structureAnalysis: 20,
    contentQuality: 20,
    formatCompatibility: 15,
    contactInformation: 10,
    quantification: 10,
  };
  return maxScores[category] || 10;
}

export default ScoreCard;
