import React from "react";
import styled from "styled-components";

const HeaderContainer = styled.div`
  text-align: center;
  color: white;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0 0 30px 0;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;

  @media (max-width: 768px) {
    gap: 20px;
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

function Header() {
  return (
    <HeaderContainer>
      <Title>AI Resume Analyzer</Title>
      <Subtitle>
        Get your ATS score and personalized improvement recommendations
      </Subtitle>

      <StatsContainer>
        <StatItem>
          <StatNumber>80%</StatNumber>
          <StatLabel>Accuracy Rate</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>15sec</StatNumber>
          <StatLabel>Analysis Time</StatLabel>
        </StatItem>
      </StatsContainer>
    </HeaderContainer>
  );
}

export default Header;
