import React, { ReactElement } from "react";
import styled from "styled-components";
import * as assets from "../../assets";

const HeaderShell = styled.header`
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 22px 18px 12px;
  box-sizing: border-box;
`;

const Brand = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: 22px;
  padding: 10px 29px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 24px;
    height: 34px;
    border-top: 1px solid var(--cf-accent);
    border-bottom: 1px solid var(--cf-accent);
    opacity: 0.72;
    transform: translateY(-50%) skewX(-18deg);
  }

  &::before {
    left: 0;
    border-left: 2px solid var(--cf-accent);
  }

  &::after {
    right: 0;
    border-right: 2px solid var(--cf-accent);
  }

  @media screen and (max-width: 560px) {
    gap: 12px;
    padding: 8px 18px;
  }
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  text-decoration: none;
  transition: transform 180ms ease, filter 180ms ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.16);
  }

  &:focus-visible {
    outline: 1px solid var(--cf-accent-bright);
    outline-offset: 5px;
    border-radius: 3px;
  }
`;

const Logo = styled.img`
  display: block;
  width: auto;
  height: 42px;
  object-fit: contain;
  filter: brightness(0) invert(1) drop-shadow(0 0 13px var(--cf-glow-soft));

  @media screen and (max-width: 560px) {
    height: 31px;
    max-width: 112px;
  }
`;

const Alliance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 58px;
`;

const Cross = styled.span`
  color: var(--cf-accent-bright);
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  text-shadow: 0 0 14px var(--cf-glow);
  transform: rotate(45deg);
`;

const AllianceLabel = styled.span`
  margin-top: 7px;
  color: var(--cf-text-muted);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;

  @media screen and (max-width: 560px) {
    display: none;
  }
`;

const BrandHeader: React.FC = (): ReactElement => (
  <HeaderShell>
    <Brand>
      <LogoLink
        href="https://codeforces.com/"
        target="_blank"
        rel="noopener noreferrer"
        title="Codeforces"
      >
        <Logo src={assets.images.codeforcesIcon} alt="Codeforces" />
      </LogoLink>
      <Alliance aria-label="Codeforces and Palestine Polytechnic University">
        <Cross>+</Cross>
        <AllianceLabel>Code Academy</AllianceLabel>
      </Alliance>
      <LogoLink
        href="https://ppu.edu/"
        target="_blank"
        rel="noopener noreferrer"
        title="Palestine Polytechnic University"
      >
        <Logo src={assets.images.ppuccIcon} alt="Palestine Polytechnic University" />
      </LogoLink>
    </Brand>
  </HeaderShell>
);

export default BrandHeader;
