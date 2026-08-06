import React, {ReactElement} from 'react';
import styled from 'styled-components';
import {images} from '../../../assets';
import Row from '../../../lib/ui/common/Row';
import theme from '../../../lib/theme/theme';

const StyledFooter = styled.div`
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  width: 100%;
  background-color: ${theme.surface};
  border-top: 1px solid ${theme.border};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
  box-shadow: 0 -18px 55px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(12px);
  padding: 6px 0;
  color: ${theme.textMuted};
  font-size: 14px;
`;

const GithubLogo = styled.img`
  width: 20px;
  margin: 6px 10px;
  opacity: 0.7;
`;

const Link = styled(Row)`
  cursor: pointer;
  width: auto;
  transition: 0.3s;

  &:hover {
    color: ${theme.accentBright};

    img {
      opacity: 1;
    }
  }
`;

const originalRepositoryUrl: string =
  'https://github.com/KarimElghamry/Codeforces-Randomizer';

const projectRepositoryUrl: string =
  'https://github.com/Basel-Jabari/Codeforces-Randomizer';

const Footer: React.FC = (): ReactElement => {
  return (
    <StyledFooter>
      <Link onClick={() => window.open(originalRepositoryUrl, '_blank')}>
        <GithubLogo src={images.githubLogo} alt=""></GithubLogo>
        <div>Codeforces Randomizer — Karim Elghamry</div>
      </Link>
      <Link onClick={() => window.open(projectRepositoryUrl, '_blank')}>
        <GithubLogo src={images.githubLogo} alt=""></GithubLogo>
        <div>
          CodeAcademy-Codeforces — Basel Al-Jabari, Bara Wazwaz, Mohammed
          Al-Shareef
        </div>
      </Link>
    </StyledFooter>
  );
};

export default Footer;
