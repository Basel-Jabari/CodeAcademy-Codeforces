import React, {ReactElement, useEffect} from 'react';
import ProblemCard from './ProblemCard';
import {ProblemStatistics} from '../../../lib/models/ProblemStatistics';
import {Problem} from '../../../lib/models/Problem';
import styled from 'styled-components';
import EmptySection from './EmptySection';
import Row from '../../../lib/ui/common/Row';
import theme from '../../../lib/theme/theme';

interface Props {
  problemsList: Array<{problem: Problem; problemStatistics: ProblemStatistics}>;
}

const StyleProblemsSection = styled.div`
  margin-top: 14px;
  height: 300px;
  width: 100%;
  overflow-y: auto;
  scrollbar-color: ${theme.borderBright} transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${theme.borderBright};
    border-radius: 5px;
  }

`;

const ProblemsSection: React.FC<Props> = (props: Props): ReactElement => {
  const problemsList = props.problemsList;
  let wrapperRef: HTMLDivElement | null = null;

  useEffect(() => {
    if (!wrapperRef) return;

    wrapperRef.scrollTo(0, 0);
  }, [problemsList, wrapperRef]);

  return (
    <Row>
      <StyleProblemsSection ref={(ref) => (wrapperRef = ref)}>
        {problemsList.length === 0 ? (
          <EmptySection></EmptySection>
        ) : (
          problemsList
            .map((val, index) => {
              return (
                <ProblemCard
                  key={index}
                  problem={val.problem}
                  problemStatistics={val.problemStatistics}
                ></ProblemCard>
              );
            })
            .reverse()
        )}
      </StyleProblemsSection>
    </Row>
  );
};

export default ProblemsSection;
