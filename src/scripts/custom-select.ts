import { SelectorMap } from "./constants";
import { getAttrFromSelector } from "./utils";

let _activeCustomSelectKey: string | null = null;

function getCustomSelectSelectorWithKey(key: string) {
  return `[${getAttrFromSelector(SelectorMap.CustomSelect)}='${key}']`;
}

function closeCustomSelect(key: string) {
  const customSelect = document.querySelector<HTMLDivElement>(
    getCustomSelectSelectorWithKey(key),
  );

  if (!customSelect) return;

  const trigger = customSelect.querySelector<HTMLButtonElement>(
    SelectorMap.CustomSelectTrigger,
  );
  const content = customSelect.querySelector<HTMLDivElement>(
    SelectorMap.CustomSelectContent,
  );

  const searchInput = customSelect.querySelector<HTMLInputElement>(
    SelectorMap.CustomSelectSearch,
  );

  const options = customSelect.querySelectorAll(SelectorMap.CustomSelectOption);
  const empty = customSelect.querySelector(SelectorMap.CustomSelectEmpty);

  if (!trigger || !content) return;

  if (searchInput && searchInput.value !== "") {
    searchInput.value = "";
    if (options.length)
      options.forEach((option) => (option.ariaHidden = "false"));
    if (empty) empty.ariaHidden = "true";
  }

  trigger.ariaExpanded = "false";
  content.ariaHidden = "true";

  _activeCustomSelectKey = null;
}

export function openCustomSelect(trigger: HTMLButtonElement) {
  const controller = new AbortController();
  const container = trigger.closest<HTMLDivElement>(SelectorMap.CustomSelect);

  if (!container) return;

  let key = container.getAttribute(
    getAttrFromSelector(SelectorMap.CustomSelect),
  );

  if (key && _activeCustomSelectKey === key) {
    closeCustomSelect(key);
    return;
  }

  if (key === "")
    container.setAttribute(
      getAttrFromSelector(SelectorMap.CustomSelect),
      (key = crypto.randomUUID()),
    );

  const content = container.querySelector<HTMLDivElement>(
    SelectorMap.CustomSelectContent,
  );

  if (!content) return;

  trigger.ariaExpanded = "true";
  content.ariaHidden = "false";

  _activeCustomSelectKey = key;

  const input = container.querySelector<HTMLInputElement>(
    SelectorMap.CustomSelectInput,
  );
  const searchInput = container.querySelector(SelectorMap.CustomSelectSearch);
  const options = container.querySelectorAll(SelectorMap.CustomSelectOption);
  const empty = container.querySelector(SelectorMap.CustomSelectEmpty);
  const action = container.getAttribute("data-action");

  if (options.length)
    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (input) input.value = option.textContent ?? "";
        options.forEach((option) => (option.ariaChecked = "false"));
        option.ariaChecked = "true";
        closeCustomSelect(key!);

        if (action && action !== "") {
          const url = new URL(window.location.href);

          url.searchParams.set(input?.name ?? "", option.textContent ?? "");

          fetch(action + url.search)
            .then((res) => console.log(res))
            .catch((err) => console.error(err));
        }
      });
    });

  if (searchInput)
    searchInput.addEventListener("input", (event) => {
      let matches = options.length;

      if (options.length)
        options.forEach((option) => {
          const isMatched = option.textContent
            ?.trim()
            .toLowerCase()
            .includes(
              (event.target as HTMLInputElement).value.trim().toLowerCase(),
            );

          option.ariaHidden = isMatched ? "false" : "true";

          if (!isMatched) matches--;
        });

      if (empty) empty.ariaHidden = matches <= 0 ? "false" : "true";
    });

  const focusGuard = container.querySelector<HTMLSpanElement>(
    SelectorMap.FocusGuard,
  );

  if (focusGuard)
    focusGuard.addEventListener("focus", () => {
      trigger.focus();
    });

  document.addEventListener(
    "click",
    (event) => {
      if (
        !(event.target as HTMLElement).closest(
          getCustomSelectSelectorWithKey(key!),
        )
      ) {
        closeCustomSelect(key!);
        controller.abort();
      }
    },
    { signal: controller.signal },
  );
}
