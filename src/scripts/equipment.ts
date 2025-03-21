import { SelectorMap } from "./constants";
import { getAttrFromSelector } from "./utils";
import { openModal } from "./modal";

export function initEquipmentPartLinksHandler() {
  const linksList = document.querySelector<HTMLElement>(
    SelectorMap.EquipmentLinksList,
  );

  if (!linksList) return;

  const links = document.querySelectorAll<HTMLElement>(
    SelectorMap.EquipmentPartLink,
  );

  if (links.length === 0) return;

  const schema = document.querySelector<HTMLElement>(
    SelectorMap.EquipmentSchema,
  );

  if (!schema) return;

  const rects = schema.querySelectorAll<HTMLElement>("rect[id^=img-rect-");

  if (rects.length === 0) return;

  let _activeRects: HTMLElement[] = [];
  let _activeLink: HTMLElement | null = null;

  let _timeoutId: NodeJS.Timeout | undefined = undefined;

  function clearActive(element: HTMLElement | HTMLElement[] | null) {
    if (element) {
      if (Array.isArray(element)) {
        element.forEach((el) => {
          el.setAttribute("aria-current", "false");
          element = null;
        });
      } else {
        element.setAttribute("aria-current", "false");
        element = null;
      }
    }
  }

  function highlightEquipmentRect(id: string) {
    clearActive(_activeRects);
    const rects = RectsMap.get(id);
    if (!rects) return;
    rects.forEach((rect) => {
      rect.setAttribute("aria-current", "true");
      _activeRects.push(rect);
    });
  }

  function highlightEquipmentLink(id: string) {
    clearActive(_activeLink);
    const link = LinksMap.get(id);
    if (!link) return;
    link.setAttribute("aria-current", "true");
    _activeLink = link;
  }

  function scrollToLinkByHashId() {
    const searchParams = new URLSearchParams(window.location.search);
    const equipmentLinkId = searchParams.get("linkHashId");
    // const equipmentLinkId = window.location.hash.replace("#", "");
    if (!equipmentLinkId) return;
    const link = LinksMap.get(equipmentLinkId);
    if (!link) return;

    const focusable = link.querySelector<HTMLButtonElement>(
      "button[data-modal-trigger]",
    );

    scrollTo({
      top:
        window.scrollY -
        (window.scrollY - (link.offsetTop - window.innerHeight / 2)),
    });

    link.ariaCurrent = "true";

    focusable?.focus({ preventScroll: true });

    setTimeout(() => {
      link.ariaCurrent = "false";
    }, 1000);
  }

  function scrollToLinkOnRectHover(link: HTMLElement) {
    const headerHeight =
      document.querySelector<HTMLElement>(SelectorMap.Header)?.offsetHeight ??
      0;
    const viewportTopPos = window.scrollY + headerHeight;
    const viewportBottomPos = window.innerHeight + window.scrollY;

    const linkCenter =
      window.scrollY -
      (window.scrollY - (link.offsetTop - window.innerHeight / 2));
    const listCenter =
      window.scrollY +
      (linksList!.offsetTop +
        linksList!.offsetHeight / 2 -
        (window.innerHeight / 2 + window.scrollY));
    const listBottom =
      window.scrollY +
      (linksList!.offsetTop + linksList!.offsetHeight - viewportBottomPos);
    const listTop = window.scrollY + linksList!.offsetTop - viewportTopPos;

    scrollTo({
      top:
        linkCenter < listCenter
          ? Math.max(linkCenter, listTop)
          : Math.min(linkCenter, listBottom),
    });
  }

  const LinksMap = Array.from(links).reduce<Map<string, HTMLElement>>(
    (acc, link) => {
      const id = link.getAttribute(
        getAttrFromSelector(SelectorMap.EquipmentPartLink),
      );
      if (!id) return acc;
      acc.set(id, link);

      link.addEventListener("focusin", (event) => {
        highlightEquipmentRect(id);
      });

      link.addEventListener("focusout", () => {
        clearActive(_activeRects);
      });

      link.addEventListener("pointerenter", (event) => {
        highlightEquipmentRect(id);
      });

      link.addEventListener("pointerleave", (event) => {
        clearActive(_activeRects);
      });

      return acc;
    },
    new Map<string, HTMLElement>(),
  );

  const RectsMap = Array.from(rects).reduce<Map<string, HTMLElement[]>>(
    (acc, rect) => {
      const attrId = rect.getAttribute("id");
      if (!attrId) return acc;
      const id = attrId.slice(attrId.lastIndexOf("-") + 1);
      const link = LinksMap.get(id);

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

      if (acc.has(id)) {
        acc.set(id, [...acc.get(id)!, rect]);
      } else {
        acc.set(id, [rect]);
      }

      rect.addEventListener("focusin", (event) => {
        highlightEquipmentLink(id);

        rect.addEventListener("keydown", (event) => {
          if (event.code === "Enter") {
            const modalKey = rect.getAttribute("data-modal-trigger");
            if (!modalKey) return;
            openModal(modalKey, rect);
          }
        });
      });

      rect.addEventListener("focusout", () => {
        clearActive(_activeLink);
      });

      if (link) {
        rect.addEventListener("pointerenter", (event) => {
          highlightEquipmentLink(id);
          _timeoutId = setTimeout(() => scrollToLinkOnRectHover(link), 200);
        });
      }

      rect.addEventListener("pointerleave", (event) => {
        if (_timeoutId) {
          clearTimeout(_timeoutId);
          _timeoutId = undefined;
        }
        clearActive(_activeLink);
      });

      return acc;
    },
    new Map<string, HTMLElement[]>(),
  );

  scrollToLinkByHashId();
}
