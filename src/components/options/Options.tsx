import React, { ReactElement, useState } from "react";
import Slider from "../slider/Slider";
import { minRating, maxRating } from "../../services/data";
import RandomizeButton from "../randomize-button/RandomizeButton";
import styled from "styled-components";
import LogicalOperator from "../../models/LogicalOperator";
import OptionsButton from "../options-button";
import Row from "../common/Row";
import theme from "../../theme";

interface Props {
  onRandomize: Function;
  onOperatorSelect: (operator: LogicalOperator) => void;
  operator: LogicalOperator;
  participantHandles: string;
  onParticipantHandlesChange: (handles: string) => void;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const operators: LogicalOperator[] = ["AND", "OR", "ONLY", "NOT"];

const HandlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: min(440px, 90vw);
  margin: 10px 0 20px 0;
`;

const HandlesLabel = styled.label`
  margin-bottom: 6px;
  font-size: 14px;
  color: ${theme.text};
`;

const HandlesHint = styled.span`
  margin-top: 6px;
  font-size: 12px;
  color: ${theme.textMuted};
`;

const HandlesInput = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 70px;
  padding: 10px;
  color: ${theme.text};
  background-color: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
  resize: vertical;
  transition: 0.3s;

  &::placeholder {
    color: ${theme.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 14px ${theme.glowSoft};
  }
`;

const Options: React.FC<Props> = (props: Props): ReactElement => {
  const [rating, setRating] = useState<{ min: number; max: number }>({
    min: minRating,
    max: maxRating,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const randomizeProblem = async () => {
    setIsLoading(true);
    await props.onRandomize(rating);
    setIsLoading(false);
  };
  return (
    <Container>
      <Row>
        {operators.map((value) => (
          <OptionsButton
            key={value}
            opertator={value}
            onClick={props.onOperatorSelect}
            isSelected={props.operator === value}
          />
        ))}
      </Row>
      <Slider
        minRating={rating.min}
        maxRating={rating.max}
        onChange={setRating}
      ></Slider>
      <HandlesContainer>
        <HandlesLabel htmlFor="participant-handles">
          Exclude problems solved by these handles (optional)
        </HandlesLabel>
        <HandlesInput
          id="participant-handles"
          placeholder="tourist, Petr, Um_nik"
          value={props.participantHandles}
          onChange={(event) =>
            props.onParticipantHandlesChange(event.target.value)
          }
        ></HandlesInput>
        <HandlesHint>
          Separate with commas, spaces or new lines. Only public accepted (OK)
          submissions are checked.
        </HandlesHint>
      </HandlesContainer>
      <RandomizeButton
        isLoading={isLoading}
        onClick={randomizeProblem}
      ></RandomizeButton>
    </Container>
  );
};

export default Options;
