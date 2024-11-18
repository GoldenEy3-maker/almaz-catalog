import { SelectorMap } from "./constants";
import {
  getAttrFromSelector,
  lockScroll,
  parseJSONWidthQuotes,
  unlockScroll,
} from "./utils";

const modalOverlay = document.querySelector<HTMLElement>(
  SelectorMap.ModalOverlay,
);

const _modalAnimationDuration = 300;

let _activeModalTrigger: HTMLElement | null = null;

function removeModal(modal: HTMLElement) {
  setTimeout(() => modal.remove(), _modalAnimationDuration);
}

export function closeModal(key: string) {
  const modal = document.querySelector<HTMLElement>(
    `[${getAttrFromSelector(SelectorMap.ModalRoot)}=${key}]`,
  );

  if (!modal) return;

  modal.ariaHidden = "true";
  if (modalOverlay) modalOverlay.ariaHidden = "true";

  unlockScroll(_modalAnimationDuration);
  removeModal(modal);

  if (_activeModalTrigger) {
    _activeModalTrigger.focus();
    _activeModalTrigger.removeAttribute("aria-current");
    _activeModalTrigger = null;
  }
}

export function openModal(key: string, trigger: HTMLElement | null = null) {
  const onCloseController = new AbortController();

  if (_activeModalTrigger) {
    const triggerKey = _activeModalTrigger.getAttribute(
      getAttrFromSelector(SelectorMap.ModalTrigger),
    );

    if (triggerKey === key) {
      closeModal(key);
      onCloseController.abort();

      return;
    }
  }

  const openedModals = document.querySelectorAll<HTMLElement>(
    `[${getAttrFromSelector(SelectorMap.ModalRoot)}]:not([aria-hidden=true])`,
  );

  if (openedModals.length) {
    openedModals.forEach((modal) => {
      modal.ariaHidden = "true";
      removeModal(modal);
    });
  } else {
    _activeModalTrigger = trigger;
    if (trigger) trigger.ariaCurrent = "true";
    lockScroll();
  }

  const template = document.getElementById(key) as HTMLTemplateElement | null;

  if (!template) return;

  const templateContent = template.content.cloneNode(true) as HTMLElement;

  const root = templateContent.querySelector<HTMLElement>(
    SelectorMap.ModalRoot,
  );
  if (!root) return;

  const wrapper = root.querySelector<HTMLElement>(SelectorMap.ModalWrapper);

  const autofocus = templateContent.querySelector<HTMLElement>(
    "[autofocus]:not([disabled])",
  );
  const focusGuard = templateContent.querySelector<HTMLElement>(
    SelectorMap.FocusGuard,
  );
  const focusable = templateContent.querySelector<HTMLElement>(
    'a, button:not([disabled]), input:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])',
  );

  root.style.animationDuration = _modalAnimationDuration + "ms";
  root.style.transitionDuration = _modalAnimationDuration + "ms";

  if (wrapper) {
    wrapper.style.animationDuration = _modalAnimationDuration + "ms";
    wrapper.style.transitionDuration = _modalAnimationDuration + "ms";
  }

  if (trigger) {
    const attrProps = trigger.getAttribute("data-modal-props");
    if (attrProps) {
      const props = parseJSONWidthQuotes(attrProps);
      Object.entries(props).forEach(([key, value]) => {
        const el = templateContent.querySelector<HTMLElement>(
          `${key}:not(input)`,
        );
        const input = templateContent.querySelector<HTMLInputElement>(
          `input${key}`,
        );
        if (el) {
          if (value != "undefined") {
            el.textContent = String(value);
          } else {
            const parent = el.parentElement;
            if (parent) {
              parent.remove();
              wrapper?.setAttribute("data-layout-changed", "true");
            }
          }
        }
        if (input) {
          if (key.includes("input-name")) input.name = String(value);
          else input.value = String(value);
        }
      });
    }
  }

  root.addEventListener(
    "pointerdown",
    (event) => {
      if (!(event.target as HTMLElement).closest(SelectorMap.ModalWrapper)) {
        closeModal(key);
        onCloseController.abort();
      }
    },
    { signal: onCloseController.signal },
  );

  document.addEventListener(
    "click",
    (event) => {
      const closeTrigger = (event.target as HTMLElement).closest(
        SelectorMap.ModalClose,
      );
      if (closeTrigger) {
        const closeTriggerKey = closeTrigger.getAttribute(
          getAttrFromSelector(SelectorMap.ModalClose),
        );
        closeModal(
          closeTriggerKey && closeTriggerKey !== "" ? closeTriggerKey : key,
        );
        onCloseController.abort();
      }
    },
    { signal: onCloseController.signal },
  );

  if (modalOverlay) {
    modalOverlay.ariaHidden = "false";
    modalOverlay.style.animationDuration = _modalAnimationDuration + "ms";
    modalOverlay.style.transitionDuration = _modalAnimationDuration + "ms";
  }

  document.body.appendChild(templateContent);

  (autofocus ?? focusable)?.focus({ preventScroll: true });

  if (focusGuard)
    focusGuard.addEventListener(
      "focus",
      () => {
        focusable?.focus();
      },
      { signal: onCloseController.signal },
    );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape") {
        closeModal(key);
        onCloseController.abort();
      }
    },
    { signal: onCloseController.signal },
  );
}
