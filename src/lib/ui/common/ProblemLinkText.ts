import styled from "styled-components";
import theme from "../../theme/theme";

const ProblemLinkText = styled.a`
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dashed ${theme.textMuted};

  &:hover {
    color: ${theme.accentBright};
    border-bottom-color: ${theme.accentBright};
  }
`;

export default ProblemLinkText;
