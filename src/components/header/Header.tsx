import React, {ReactElement} from 'react';
import styled from 'styled-components';
import * as assets from '../../assets';
import theme from '../../theme';

const Container = styled.div`
  margin: 26px 20px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// the wordmark is dark artwork, so it is flattened to white and lit from behind
const Logo = styled.img`
  filter: brightness(0) invert(1) drop-shadow(0 0 14px ${theme.glow});
`;

const Title = styled.div`
  margin-top: 6px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: ${theme.accentBright};
  text-shadow: 0 0 18px ${theme.glow};
`;

const Header: React.FC = (): ReactElement => {
  return (
    <Container>
      <Logo
        width={300}
        height={35}
        src={assets.images.codeforcesLogo}
        alt="Codeforces"
      ></Logo>
      <Title>Randomizer</Title>
    </Container>
  );
};

export default Header;
