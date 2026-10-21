import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiLeetcode, SiMedium, SiX } from "react-icons/si";
import type { IconType } from "react-icons";

export interface SocialLink {
  name: string;
  href: string;
  Icon: IconType;
  appearance: string;
}

export const SOCIALS: SocialLink[] = [
  { name: "GitHub", href: "https://github.com/Eshiv-Pandey", Icon: SiGithub, appearance: "github" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/eshiv-pandey18/", Icon: FaLinkedinIn, appearance: "linkedin" },
  { name: "Medium", href: "https://medium.com/@eshivpandey", Icon: SiMedium, appearance: "medium" },
  { name: "LeetCode", href: "https://leetcode.com/u/Eshiv_Pandey/", Icon: SiLeetcode, appearance: "leetcode" },
  { name: "X", href: "https://x.com/Eshiv_Pandey", Icon: SiX, appearance: "x" },
];
