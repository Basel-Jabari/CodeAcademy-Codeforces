import React, {ReactElement} from 'react';
import styled from 'styled-components';
import {images} from '../../assets';
import Row from '../common/Row';
import theme from '../../theme';

const StyledFooter = styled.div`
  width: 100%;
  background-color: ${theme.surface};
  border-top: 1px solid ${theme.border};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${theme.textMuted};
  font-size: 14px;
  user-select: none;
`;

const GithubLogo = styled.img`
  width: 22px;
  margin: 10px;
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

const repositoryUrl: string =
  'https://github.com/KarimElghamry/Codeforces-Randomizer';

const Footer: React.FC = (): ReactElement => {
  return (
    <StyledFooter>
      <Link onClick={() => window.open(repositoryUrl, '_blank')}>
        <GithubLogo src={images.githubLogo} alt=""></GithubLogo>
        <div>Source</div>
      </Link>
    </StyledFooter>
  );
};

export default Footer;
