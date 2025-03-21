import { SelectorMap } from "./constants";

export function initStickyHeader() {
  const header = document.querySelector<HTMLElement>(SelectorMap.Header);
  const headerTop = document.querySelector<HTMLElement>(SelectorMap.HeaderTop);

  if (!headerTop) return;

  new ResizeObserver((entries) => {
    entries.forEach(({ target }) => {
      document.body.style.setProperty(
        "--header-offset",
        `${(target as HTMLElement).offsetHeight}px`,
      );
    });
  }).observe(headerTop);

  let lastScrollPos = 0;

  header?.setAttribute(
    "aria-expanded",
    String(window.scrollY < headerTop.offsetHeight),
  );

  document.addEventListener("scroll", () => {
    header?.setAttribute(
      "aria-expanded",
      String(
        window.scrollY < headerTop.offsetHeight ||
          window.scrollY < lastScrollPos,
      ),
    );

    lastScrollPos = window.scrollY;
  });
}
