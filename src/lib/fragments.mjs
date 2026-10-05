/** Resolve shared fragments at build time without adding layout-changing DOM wrappers. */
export function renderPageHtml(page, fragments) {
  return page.html.replace(/<!--fragment:([a-z0-9-]+)-->/g, (_, name) => {
    if (!(name in fragments))
      throw new Error(`Missing shared fragment: ${name}`);
    const binding = page.fragmentBindings?.[name] || {};
    return fragments[name]
      .replace(/\{\{current-class:(\d+)\}\}/g, (_, i) =>
        binding.activeClasses?.includes(Number(i)) ? " current-menu-item" : "",
      )
      .replace(/\{\{current-anchor:(\d+)\}\}/g, (_, i) =>
        binding.currentAnchors?.includes(Number(i))
          ? ' aria-current="page"'
          : "",
      )
      .replace(/\{\{layout:(\d+)\}\}/g, (_, i) => {
        const value = binding.layoutIds?.[Number(i)];
        if (value === undefined)
          throw new Error(`Missing layout binding: ${name}/${i}`);
        return String(value);
      });
  });
}
