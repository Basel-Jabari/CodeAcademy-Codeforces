import codeforcesIcon from './codeforces_icon.png';
import ppuccIcon from './ppucc_icon.png';
import userIcon from './user.png';
import githubLogo from './gh-logo.png';
import { LoopIcon } from './LoopIcon';

export const images = {
  codeforcesIcon: typeof codeforcesIcon === 'string' ? codeforcesIcon : (codeforcesIcon as any).src,
  ppuccIcon: typeof ppuccIcon === 'string' ? ppuccIcon : (ppuccIcon as any).src,
  loopIcon: LoopIcon,
  userIcon: typeof userIcon === 'string' ? userIcon : (userIcon as any).src,
  githubLogo: typeof githubLogo === 'string' ? githubLogo : (githubLogo as any).src,
};
