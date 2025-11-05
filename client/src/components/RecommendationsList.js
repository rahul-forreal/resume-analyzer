import React from "react";
import styled from "styled-components";

const RecommendationsContainer = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  padding: 30px;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0 0 20px 0;
`;

const StrengthsContainer = styled.div`
  margin-bottom: 30px;
`;

const StrengthsTitle = styled.h4`
  font-size: 1.2rem;
  color: #38a169;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
`;

const StrengthIcon = styled.span`
  margin-right: 8px;
`;

const StrengthsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StrengthItem = styled.li`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 8px;
  color: #276749;
  font-size: 0.9rem;
`;

const RecommendationItem = styled.div`
  background: ${(props) => {
    if (props.priority === "high") return "#fed7d7";
    if (props.priority === "medium") return "#fef7e0";
    return "#e6fffa";
  }};
  border: 1px solid
    ${(props) => {
      if (props.priority === "high") return "#feb2b2";
      if (props.priority === "medium") return "#f6e05e";
      return "#81e6d9";
    }};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PriorityBadge = styled.span`
  background: ${(props) => {
    if (props.priority === "high") return "#e53e3e";
    if (props.priority === "medium") return "#d69e2e";
    return "#319795";
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const Category = styled.span`
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Suggestion = styled.p`
  margin: 0;
  color: #2d3748;
  font-size: 0.9rem;
  line-height: 1.5;
`;

function RecommendationsList({ recommendations, strengths }) {
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });

  return (
    <RecommendationsContainer>
      {strengths && strengths.length > 0 && (
        <StrengthsContainer>
          <StrengthsTitle>
            <StrengthIcon>✅</StrengthIcon>
            Strengths
          </StrengthsTitle>
          <StrengthsList>
            {strengths.map((strength, index) => (
              <StrengthItem key={index}>{strength}</StrengthItem>
            ))}
          </StrengthsList>
        </StrengthsContainer>
      )}

      <Title>Improvement Recommendations</Title>

      {sortedRecommendations.length === 0 ? (
        <div style={{ textAlign: "center", color: "#718096", padding: "20px" }}>
          Great job! No specific recommendations at this time.
        </div>
      ) : (
        sortedRecommendations.map((rec, index) => (
          <RecommendationItem key={index} priority={rec.priority}>
            <RecommendationHeader>
              <Category>{rec.category}</Category>
              <PriorityBadge priority={rec.priority}>
                {rec.priority} Priority
              </PriorityBadge>
            </RecommendationHeader>
            <Suggestion>{rec.suggestion}</Suggestion>
          </RecommendationItem>
        ))
      )}
    </RecommendationsContainer>
  );
}

export default RecommendationsList;
