import { z } from "zod";
import { SelectorMap } from "./constants";
import { getAttrFromSelector, getRandomIntInclusive } from "./utils";

const SuggestionsDataSchema = z.object({
  id: z.string(),
  title: z.string(),
});

let _suggestionsFetchDebounceTimeoutId: NodeJS.Timeout | undefined = undefined;

function getSuggestionsAction(input: HTMLInputElement) {
  const action = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsAction),
  );
  if (!action || action === "")
    throw new Error("Suggestions input must have filled action attr");

  return action;
}

function getSuggestionsMenu(input: HTMLInputElement) {
  const menuRef = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsMenu),
  );
  if (!menuRef || menuRef === "")
    throw new Error("Suggestions input must have filled menu attr");
  const menu = document.getElementById(menuRef);
  if (!menu) throw new Error("Cannot find suggetions menu by given ref");
  return menu;
}

function getSuggestionsMenuContainer(menu: HTMLElement) {
  const container = menu.querySelector<HTMLElement>(
    SelectorMap.SuggestionsMenuContainer,
  );
  if (!container)
    throw new Error("Cannot find suggetions menu container by given ref");
  return container;
}

function getSuggestionsMenuItem(menu: HTMLElement) {
  const item = menu.querySelector<HTMLTemplateElement>(
    SelectorMap.SuggestionsMenuItem,
  );
  if (!item) throw new Error("Cannot find suggetions menu item by given ref");
  return item;
}

function getSuggestionsMenuEmpty(menu: HTMLElement) {
  const empty = menu.querySelector<HTMLTemplateElement>(
    SelectorMap.SuggestionsMenuEmpty,
  );
  if (!empty) throw new Error("Cannot find suggetions menu empty by given ref");
  return empty;
}

function getSuggestionsMenuAllResultsBtn(menu: HTMLElement) {
  const btn = menu.querySelector<HTMLButtonElement>(
    SelectorMap.SuggestionsAllResults,
  );
  return btn;
}

function clearSuggestionsMenuContainer(input: HTMLInputElement) {
  const menu = getSuggestionsMenu(input);
  const menuContainer = getSuggestionsMenuContainer(menu);
  const allResultsBtn = getSuggestionsMenuAllResultsBtn(menu);

  allResultsBtn?.setAttribute("aria-hidden", "false");
  menuContainer.innerHTML = "";
}

let _suggestionsFocusIndex = 0;

export function suggestionsArrowFocusHandler(event: KeyboardEvent) {
  const controller = new AbortController();
  const inputs = document.querySelectorAll<HTMLInputElement>(
    SelectorMap.SuggestionsMenu,
  );

  if (inputs.length)
    inputs.forEach((input) => {
      const menuRef = input.getAttribute(
        getAttrFromSelector(SelectorMap.SuggestionsMenu),
      );
      if (!menuRef) return;
      const menu = document.querySelector(`#${menuRef}[aria-hidden='false']`);
      if (!menu) return;
      const links = Array.from(menu.querySelectorAll("a"));
      if (!links.length) return;

      event.preventDefault();

      if (event.code === "ArrowDown") {
        if (
          !document.activeElement?.closest(
            `#${menuRef}[aria-hidden='false']`,
          ) ||
          document.activeElement === links.at(-1)
        ) {
          _suggestionsFocusIndex = 0;
        } else {
          _suggestionsFocusIndex++;
        }
      }

      if (event.code === "ArrowUp") {
        if (
          !document.activeElement?.closest(`#${menuRef}[aria-hidden='false']`)
        ) {
          _suggestionsFocusIndex = 0;
        } else if (document.activeElement === links[0]) {
          _suggestionsFocusIndex = links.length - 1;
        } else {
          _suggestionsFocusIndex--;
        }
      }

      links[_suggestionsFocusIndex]?.focus();

      document.addEventListener(
        "keydown",
        (event) => {
          if (
            event.code === "ArrowUp" ||
            event.code === "ArrowDown" ||
            event.code === "Enter"
          )
            return;

          input.focus();
          controller.abort();
        },
        { signal: controller.signal },
      );
    });
}

export function suggestionsFocusHandler(input: HTMLInputElement) {
  const controller = new AbortController();
  const menu = getSuggestionsMenu(input);
  const isInputEmpty = input.value !== "";

  if (isInputEmpty) menu.ariaHidden = "false";

  // Click outside handler
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement;
      const isTargetClosestToMenu = target.closest(`#${menu.id}`);
      const isTargetClosestToInput = target.closest(
        `[${getAttrFromSelector(SelectorMap.SuggestionsAction)}='${getSuggestionsAction(input)}']`,
      );

      if (isInputEmpty && (isTargetClosestToMenu || isTargetClosestToInput)) {
        menu.ariaHidden = "false";
      } else {
        menu.ariaHidden = "true";
        if (isInputEmpty) controller.abort();
      }
    },
    { signal: controller.signal },
  );
}

export function suggestionsBlurHandler(
  input: HTMLInputElement,
  relatedTarget: HTMLElement | null,
) {
  const controller = new AbortController();
  const menu = getSuggestionsMenu(input);

  menu.addEventListener(
    "focusout",
    (event) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;

      if (relatedTarget && !relatedTarget.closest(`#${menu.id}`)) {
        menu.ariaHidden = "true";
        controller.abort();
      }
    },
    { signal: controller.signal },
  );

  if (relatedTarget && !relatedTarget.closest(`#${menu.id}`))
    menu.ariaHidden = "true";
}

export function suggestionsInputHandler(input: HTMLInputElement) {
  const action = getSuggestionsAction(input);
  const menu = getSuggestionsMenu(input);
  const menuContainer = getSuggestionsMenuContainer(menu);
  const itemTemplate = getSuggestionsMenuItem(menu);
  const emptyTemplate = getSuggestionsMenuEmpty(menu);
  const allResultsBtn = getSuggestionsMenuAllResultsBtn(menu);

  if (_suggestionsFetchDebounceTimeoutId) {
    clearTimeout(_suggestionsFetchDebounceTimeoutId);
    _suggestionsFetchDebounceTimeoutId = undefined;
  }

  if (input.value === "") {
    menu.ariaHidden = "true";
    return;
  }

  _suggestionsFetchDebounceTimeoutId = setTimeout(async () => {
    try {
      const res = await fetch(`${action}?${input.name ?? "q"}=${input.value}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = (await res.json()) as z.infer<
        typeof SuggestionsDataSchema
      >[];
      // const data = [
      //   { id: "1", title: "Болт М12-6gx80 (S18) ГОСТ 7798-70" },
      //   { id: "2", title: "Болт М12x1,25-6gx90 ГОСТ 7798-70" },
      //   { id: "3", title: "Болт М8 - 6g  20.58.019" },
      //   { id: "4", title: "Болт М12-6gx80 (S18) ГОСТ 7798-70" },
      //   { id: "5", title: "Болт М12x1,25-6gx90 ГОСТ 7798-70" },
      // ] as z.infer<typeof SuggestionsDataSchema>[];

      // const randomData = data.slice(0, getRandomIntInclusive(0, 5));

      clearSuggestionsMenuContainer(input);

      if (data.length) {
        data.forEach((item) => {
          const resolvedItem = SuggestionsDataSchema.parse(item);

          const templateContent = itemTemplate.content.cloneNode(true);

          const link = templateContent.firstChild as HTMLAnchorElement;
          link.href += `?linkHashId=${resolvedItem.id}`;
          link.textContent = resolvedItem.title;

          menuContainer.appendChild(link);
        });
      } else {
        const templateContent = emptyTemplate.content.cloneNode(true);
        menuContainer.appendChild(templateContent);
        allResultsBtn?.setAttribute("aria-hidden", "true");
      }

      menu.ariaHidden = "false";
    } catch (error) {
      console.error(error);
    }
  }, 350);
}
