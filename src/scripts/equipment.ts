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
    link.setAttribute("aria-current", "true");
    _activeLink = link;
  }

  function scrollToLinkBySearchParamsId() {
    const searchParams = new URLSearchParams(window.location.search);
    const equipmentLinkId = searchParams.get("equipmentLinkId");
    if (!equipmentLinkId) return;
    const link = LinksMap[equipmentLinkId];
    if (!link) return;
    const headerHeight =
      document.querySelector<HTMLElement>(SelectorMap.Header)?.offsetHeight ??
      0;

    const y = window.scrollY + link.offsetTop - window.innerHeight / 2;

    scrollTo({
      top: y,
    });

    link.ariaCurrent = "true";

    setTimeout(() => {
      link.ariaCurrent = "false";
    }, 1000);
  }

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

  const RectsMap = Array.from(rects).reduce<Record<string, HTMLElement>>(
    (acc, rect) => {
      const attrId = rect.getAttribute("id");
      if (!attrId) return acc;
      const id = attrId.slice(attrId.lastIndexOf("-") + 1);
      const link = LinksMap[id];

      if (link) {
        const cartModalTrigger = link.querySelector(
          "[data-modal-trigger='cart']",
        );

        if (cartModalTrigger) {
          const cartModalTriggerProps =
            cartModalTrigger?.getAttribute("data-modal-props");
          rect.setAttribute("data-modal-trigger", "cart");
          if (cartModalTriggerProps)
            rect.setAttribute("data-modal-props", cartModalTriggerProps);
        }
      }

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

  scrollToLinkBySearchParamsId();
}
