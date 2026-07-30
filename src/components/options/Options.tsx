import React, { ReactElement, useRef, useState } from "react";
import Slider from "../slider/Slider";
import { minRating, maxRating } from "../../services/data";
import RandomizeButton from "../randomize-button/RandomizeButton";
import styled from "styled-components";
import OutlineButton from "../common/OutlineButton";
import theme from "../../theme";
import { parseHandles } from "../../services/submissions";
import {
  formatHandleList,
  parseHandleList,
  readFileAsText,
} from "../../services/handleList";

interface Props {
  onRandomize: Function;
  participantHandles: string;
  onParticipantHandlesChange: (handles: string) => void;
  onError: (message: string) => void;
}

const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px;
  background-color: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 14px;
  box-shadow: 0 0 26px ${theme.glowSoft};
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.accentBright};
`;

const HandlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 4px 0 20px 0;
`;

const HandlesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const HandlesLabel = styled.label`
  font-size: 14px;
  color: ${theme.text};
`;

const HandlesCount = styled.span`
  font-size: 12px;
  color: ${theme.accentBright};
`;

const HandlesHint = styled.span`
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: ${theme.textMuted};
`;

const HandlesInput = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 70px;
  padding: 10px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 8px;
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

const HandlesActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Options: React.FC<Props> = (props: Props): ReactElement => {
  const [rating, setRating] = useState<{ min: number; max: number }>({
    min: minRating,
    max: maxRating,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCount: number = parseHandles(props.participantHandles).length;

  const randomizeProblem = async () => {
    setIsLoading(true);
    await props.onRandomize(rating);
    setIsLoading(false);
  };

  const uploadHandleList = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input: HTMLInputElement = event.target;
    const file: File | null = input.files && input.files[0];
    // clearing the value lets the same file be picked again later
    input.value = "";
    if (!file) return;

    try {
      const uploaded: string[] = parseHandleList(await readFileAsText(file));

      if (uploaded.length === 0) {
        props.onError(`No handles found in ${file.name}.`);
        return;
      }

      const merged: string[] = parseHandles(
        `${props.participantHandles}, ${formatHandleList(uploaded)}`,
      );
      props.onParticipantHandlesChange(formatHandleList(merged));
    } catch (e) {
      props.onError(e.message);
    }
  };

  return (
    <Card>
      <Title>Rating & participants</Title>

      <Slider
        minRating={rating.min}
        maxRating={rating.max}
        onChange={setRating}
      ></Slider>

      <HandlesContainer>
        <HandlesHeader>
          <HandlesLabel htmlFor="participant-handles">
            Participant handles (optional)
          </HandlesLabel>
          {handleCount > 0 ? (
            <HandlesCount>
              {handleCount} {handleCount === 1 ? "handle" : "handles"}
            </HandlesCount>
          ) : null}
        </HandlesHeader>
        <HandlesInput
          id="participant-handles"
          placeholder="_Basel_, Momen-G-Ar, mohammad_shareef, Mr.Belal, NitronBeam"
          value={props.participantHandles}
          onChange={(event) =>
            props.onParticipantHandlesChange(event.target.value)
          }
        ></HandlesInput>
        <HandlesActions>
          <OutlineButton
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Upload list
          </OutlineButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.tsv,text/plain,text/csv"
            onChange={uploadHandleList}
          ></HiddenFileInput>
        </HandlesActions>
        <HandlesHint>
          Used only by Randomize: problems solved by any of these handles are
          skipped. Upload a .txt / .csv / .tsv — every non-empty cell becomes a
          handle. Cross Analysis and Contest Builder keep their own lists.
        </HandlesHint>
      </HandlesContainer>

      <RandomizeButton
        isLoading={isLoading}
        onClick={randomizeProblem}
      ></RandomizeButton>
    </Card>
  );
};

export default Options;
