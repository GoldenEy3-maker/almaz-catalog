import { SelectorMap } from "./constants";
import { lockScroll, unlockScroll } from "./utils";

export function initSubmenu() {
  const _animationDuration = 300;

  const trigger = document.querySelector<HTMLElement>(
    SelectorMap.SubmenuTrigger,
  );
  const submenu = document.querySelector<HTMLElement>(SelectorMap.Submenu);

  if (!trigger || !submenu) return;

  submenu.addEventListener("focusout", (event) => {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && !relatedTarget.closest(SelectorMap.Submenu))
      trigger.focus();
  });

  trigger.addEventListener("blur", () => {
    if (submenu.ariaHidden === "false") {
      const links = submenu.querySelectorAll("a");

      if (!links.length) return;

      for (const link of links) {
        if (link.checkVisibility()) {
          link.focus();
          break;
        }
      }
    }
  });

  function openSubmenu() {
    trigger?.setAttribute("aria-current", "true");
    submenu?.setAttribute("aria-hidden", "false");
    lockScroll();
  }

  function closeSubmenu() {
    trigger?.setAttribute("aria-current", "false");
    submenu?.setAttribute("aria-hidden", "true");
    unlockScroll(_animationDuration);
  }

  trigger.addEventListener("click", () => {
    submenu.style.transitionDuration = _animationDuration + "ms";
    submenu.style.animationDuration = _animationDuration + "ms";

    submenu.ariaHidden === "true" ? openSubmenu() : closeSubmenu();
  });

  submenu.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (
      !target.closest(SelectorMap.SubmenuWrapper) ||
      !target.closest(SelectorMap.Header)
    ) {
      closeSubmenu();
    }
  });
}
