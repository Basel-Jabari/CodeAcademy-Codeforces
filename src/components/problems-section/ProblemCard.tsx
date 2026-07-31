import React, {ReactElement} from 'react';
import styled, {keyframes} from 'styled-components';
import {Problem} from '../../models/Problem';
import {ProblemStatistics} from '../../models/ProblemStatistics';
import {images} from '../../assets';
import theme from '../../theme';
import {getProblemUrl} from '../../services/problemLink';

interface CardProps {
  problem: Problem;
  problemStatistics: ProblemStatistics;
}

interface CellProps {
  flex: number;
}

const EnterAnim = keyframes`
from{
  margin-left: -50%;
}
to{
  margin-left: 20px: 
}
`;

const StyledProblemCard = styled.div`
  box-sizing: border-box;
  width: calc(100% - 24px);
  min-height: 72px;
  background-color: ${theme.surface};
  border: 1px solid ${theme.border};
  color: ${theme.text};
  margin: 12px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  transition-duration: 0.3s;
  animation: ${EnterAnim} 0.5s cubic-bezier(0.2, 0, 0, 1.2);

  &:hover {
    background-color: ${theme.surfaceHover};
    border-color: ${theme.accent};
    box-shadow: 0 0 20px ${theme.glowSoft};
  }
`;

const Cell = styled.div<CellProps>`
  flex: ${(props) => props.flex};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`;

const IdCell = styled(Cell)`
  color: ${theme.accentBright};
  font-weight: 600;
`;

const RatingCell = styled(Cell)`
  color: ${theme.cyan};
  font-weight: 600;
`;

const SolvedCell = styled(Cell)`
  color: ${theme.textMuted};
  gap: 4px;
`;

const ProblemCard: React.FC<CardProps> = (props: CardProps): ReactElement => {
  const problem: Problem = props.problem;
  const problemStats: ProblemStatistics = props.problemStatistics;

  const handleUrlRedirect = () => {
    const redirectUrl: string = getProblemUrl({
      contestId: problem.contestId,
      index: problem.index,
    });
    window.open(redirectUrl, '_blank');
  };

  return (
    <StyledProblemCard
      onClick={() => {
        handleUrlRedirect();
      }}
    >
      <IdCell flex={1}>{`${problemStats.contestId}${problemStats.index}`}</IdCell>
      <Cell flex={2}>{`${problem.name}`}</Cell>
      <RatingCell flex={1}>{`${
        problem.rating === undefined ? 0 : problem.rating
      }`}</RatingCell>
      <SolvedCell flex={1}>
        <img src={images.userIcon} alt=""></img>
        <span>{`x${problemStats.solvedCount}`}</span>
      </SolvedCell>
    </StyledProblemCard>
  );
};

export default ProblemCard;
