import React, {ReactElement} from 'react';
import styled from 'styled-components';
import * as assets from '../../../assets';
import theme from '../../../lib/theme/theme';

const Container = styled.div`
  margin: 26px 20px 12px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BrandRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px 28px;
`;

const BrandBlock = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  line-height: 0;
`;

const Logo = styled.img`
  height: 48px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: brightness(0) invert(1) drop-shadow(0 0 14px ${theme.glow});
`;

const Join = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1;
  color: ${theme.cyan};
  text-shadow: 0 0 14px ${theme.cyanGlow};
`;

const Header: React.FC = (): ReactElement => {
  return (
    <Container>
      <BrandRow>
        <BrandBlock
          href="https://linktr.ee/PPUCodeAcademy12"
          target="_blank"
          rel="noopener noreferrer"
          title="PPU Code Academy"
        >
          <Logo src={assets.images.ppuccIcon} alt="PPU Code Academy logo" />
        </BrandBlock>

        <Join>X</Join>

        <BrandBlock
          href="https://codeforces.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Codeforces"
        >
          <Logo src={assets.images.codeforcesIcon} alt="Codeforces logo" />
        </BrandBlock>
      </BrandRow>
    </Container>
  );
};

export default Header;
