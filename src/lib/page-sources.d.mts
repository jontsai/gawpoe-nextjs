import type { FragmentBinding } from "./fragments.mjs";
export interface PageSource {
  path: string;
  title: string;
  description: string;
  bodyClass: string;
  cssPath: string;
  html: string;
  sourceLinks: string[];
  sourceFile?: string;
  legacy?: boolean;
  sourceTextHash: string;
  sourceTextLength: number;
  fragmentBindings?: Record<string, FragmentBinding | undefined>;
}
export function readSiteContent(root?: string): {
  pages: PageSource[];
  redirects: { from: string; to: string; status: number }[];
};
