export type FragmentBinding = {
  activeClasses?: number[];
  currentAnchors?: number[];
  layoutIds?: string[];
};
export function renderPageHtml(
  page: {
    html: string;
    fragmentBindings?: Record<string, FragmentBinding | undefined>;
  },
  fragments: Record<string, string>,
): string;
