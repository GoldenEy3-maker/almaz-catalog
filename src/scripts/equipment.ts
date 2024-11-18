import { SelectorMap } from "./constants";
import { getAttrFromSelector } from "./utils";

export function initEquipmentPartLinksHandler() {
  const links = document.querySelectorAll<HTMLElement>(
    SelectorMap.EquipmentPartLink,
  );
  const schema = document.querySelector<HTMLElement>(
    SelectorMap.EquipmentSchema,
  );

  if (!schema) return;

  let _activeRect: HTMLElement | null = null;
  let _activeLink: HTMLElement | null = null;

  const rects = schema.querySelectorAll<HTMLElement>("rect[id^=img-rect-");

  if (rects.length === 0) return;

  function scrollToLink(linkOffsetTop: number, linkHeight: number) {
    const headerHeight = document.querySelector<HTMLElement>(
      SelectorMap.Header,
    )?.offsetHeight;
    const viewportTopPos = headerHeight
      ? window.scrollY + headerHeight
      : window.scrollY;
    const viewportBottomPos = window.innerHeight + window.scrollY;

    const topDiff = linkOffsetTop - viewportTopPos;
    const bottomDiff = linkOffsetTop + linkHeight - viewportBottomPos;

    if (topDiff <= 0) {
      scrollTo({
        top: window.scrollY + topDiff - 20,
      });
    } else if (bottomDiff >= 0) {
      scrollTo({
        top: window.scrollY + bottomDiff + 40,
      });
    }
  }

  function clearActive(element: HTMLElement | null) {
    if (element) {
      element.setAttribute("aria-current", "false");
      element = null;
    }
  }

  function highlightEquipmentRect(id: string) {
    clearActive(_activeRect);
    const rect = RectsMap[id];
    if (!rect) return;
    rect.setAttribute("aria-current", "true");
    _activeRect = rect;
  }

  function highlightEquipmentLink(id: string) {
    clearActive(_activeLink);
    const link = LinksMap[id];
    if (!link) return;
    scrollToLink(link.offsetTop, link.offsetHeight);
    // scrollTo({
    //   top: window.scrollY + link.getBoundingClientRect().top - 160,
    //   behavior: "smooth",
    // });
    link.setAttribute("aria-current", "true");
    _activeLink = link;
  }

  const RectsMap = Array.from(rects).reduce<Record<string, HTMLElement>>(
    (acc, rect) => {
      const attrId = rect.getAttribute("id");
      if (!attrId) return acc;
      const id = attrId.slice(attrId.lastIndexOf("-") + 1);
      acc[id] = rect;

      rect.addEventListener("focusin", (event) => {
        highlightEquipmentLink(id);
      });

      rect.addEventListener("focusout", () => {
        clearActive(_activeLink);
      });

      rect.addEventListener("pointerenter", (event) => {
        highlightEquipmentLink(id);
      });

      rect.addEventListener("pointerleave", (event) => {
        clearActive(_activeLink);
      });

      return acc;
    },
    {},
  );

  const LinksMap = Array.from(links).reduce<Record<string, HTMLElement>>(
    (acc, link) => {
      const id = link.getAttribute(
        getAttrFromSelector(SelectorMap.EquipmentPartLink),
      );
      if (!id) return acc;
      acc[id] = link;

      link.addEventListener("focusin", (event) => {
        highlightEquipmentRect(id);
      });

      link.addEventListener("focusout", () => {
        clearActive(_activeRect);
      });

      link.addEventListener("pointerenter", (event) => {
        highlightEquipmentRect(id);
      });

      link.addEventListener("pointerleave", (event) => {
        clearActive(_activeRect);
      });

      return acc;
    },
    {},
  );
}
