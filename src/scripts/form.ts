import { SelectorMap } from "./constants";
import { z } from "zod";
import { getAttrFromSelector } from "./utils";
import { setCartCounter } from "./cart-counter";

function generateResolver(input: HTMLInputElement) {
  let parser = z.string({
    required_error: input.required ? "Обязательное поле" : undefined,
  });

  if (input.pattern) {
    parser = parser.regex(
      new RegExp(`^(?:${input.pattern})$`),
      input.getAttribute("data-pattern-text") ?? undefined,
    );
  }

  if (input.minLength !== undefined && input.minLength !== -1) {
    parser = parser.min(
      input.minLength,
      `Минимальное количество символов поля ${input.minLength}`,
    );
  }

  return parser;
}

function validateField(
  input: HTMLInputElement,
  resolver: z.ZodString,
  messageContainer?: HTMLParagraphElement | null,
) {
  const result = resolver.safeParse(
    input.value !== "" ? input.value : undefined,
  );

  if (result.error) {
    input.ariaInvalid = "true";
    if (messageContainer)
      messageContainer.textContent = result.error?.flatten().formErrors[0];
    return false;
  }

  input.ariaInvalid = "false";
  if (messageContainer) messageContainer.textContent = "";
  return true;
}

function validateForm(
  form: HTMLFormElement,
  watchCallback?: (isValid: boolean) => void,
) {
  const controls = form.querySelectorAll<HTMLDivElement>(
    SelectorMap.FormControl,
  );

  let isValid = true;

  controls.forEach((control) => {
    const input = control.querySelector<HTMLInputElement>("input");
    const messageContainer = control.querySelector<HTMLParagraphElement>(
      SelectorMap.FormControlMessage,
    );

    if (!input) return;

    const resolver = generateResolver(input);

    isValid = validateField(input, resolver, messageContainer);
    input.addEventListener("input", () => {
      isValid = validateField(input, resolver, messageContainer);
      watchCallback?.(
        form.querySelector(
          `${SelectorMap.FormControl} input[aria-invalid=true]`,
        )
          ? false
          : true,
      );
    });
  });

  return isValid;
}

export function formSubmitHandler(event: SubmitEvent) {
  event.preventDefault();

  const submitter = event.submitter;
  const target = event.target as HTMLFormElement;

  const isValid = validateForm(target);

  const responseContainer = target.querySelector<HTMLParagraphElement>(
    SelectorMap.FormResponse,
  );
  const successRedirectUrl = target.getAttribute("data-form-success-redirect");
  const isValidationWatcher =
    target.getAttribute(
      getAttrFromSelector(SelectorMap.FormWithValidationWatcher),
    ) !== null;
  const isFormNoReset = target.getAttribute("data-form-no-reset") !== null;
  const submitterReplace = submitter?.getAttribute(
    "data-form-success-submitter-replace",
  );
  const successSetCartCounterKey = target.getAttribute(
    "data-form-success-set-cart-counter",
  );

  const requestAsArray = target.getAttribute("data-form-request-as-array");

  if (!isValid) return;

  const formData = new FormData(target);

  // @ts-expect-error FormData in URLSearchParams constructor
  const urlParams = new URLSearchParams(formData);

  let body: {} | FormData = formData;

  const elements = target.elements;

  if (requestAsArray && requestAsArray !== "") {
    const bodyKeys = Array.from(
      target.querySelectorAll<HTMLInputElement>("input[data-form-body-key]"),
    );

    const groupBodyKeys = bodyKeys.reduce<Record<string, HTMLInputElement[]>>(
      (acc, input) => {
        const key = input.getAttribute("data-form-body-key");

        if (!key) return acc;

        const inputs = acc[key];

        if (inputs) {
          acc[key].push(input);
        } else {
          acc[key] = [input];
        }

        return acc;
      },
      {},
    );

    body = {
      [requestAsArray]: Object.entries(groupBodyKeys).map(([_, inputs]) => {
        const data = inputs.reduce((acc, input) => {
          acc[input.name] = input.value;
          return acc;
        }, {});

        return data;
      }),
    };
  }

  for (let i = 0; i < elements.length; i++) {
    elements[i].setAttribute("disabled", "");
  }

  if (responseContainer) {
    responseContainer.textContent = "";
    responseContainer.ariaHidden = "true";
  }

  fetch(
    target.method === "get"
      ? `${target.action}?${urlParams.toString()}`
      : target.action,
    {
      method: target.method,
      body: target.method === "get" ? undefined : JSON.stringify(body),
    },
  )
    .then((response) => {
      if (!response.ok) {
        console.error(response.url, response.status, response.statusText);

        if (responseContainer) {
          responseContainer.textContent = "Что-то пошло не так!";
          responseContainer.ariaHidden = "false";
        }
        if (isValidationWatcher)
          for (let i = 0; i < elements.length; i++) {
            elements[i].removeAttribute("disabled");
          }
        return;
      }

      if (!isFormNoReset) target.reset();

      if (successRedirectUrl) {
        window.location.href = successRedirectUrl;
        return;
      }

      if (isValidationWatcher)
        for (let i = 0; i < elements.length; i++) {
          const isSubmitter = elements[i].closest("[type=submit]");
          if (!isSubmitter) elements[i].removeAttribute("disabled");
        }

      if (submitterReplace) {
        const replacer = target.querySelector(`#${submitterReplace}`);

        if (replacer) {
          replacer.setAttribute("aria-hidden", "false");
          submitter?.setAttribute("aria-hidden", "true");

          const counter = target.querySelector(SelectorMap.CounterInput);

          if (counter)
            counter.addEventListener("counter:change", () => {
              replacer?.setAttribute("aria-hidden", "true");
              submitter?.setAttribute("aria-hidden", "false");
            });
        }
      }

      if (successSetCartCounterKey && successSetCartCounterKey !== "") {
        response
          .json()
          .then((data) => {
            if (successSetCartCounterKey in data) {
              setCartCounter(data[successSetCartCounterKey]);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    })
    .catch((error) => {
      if (responseContainer) {
        responseContainer.textContent = error;
        responseContainer.ariaHidden = "false";
      }
      console.error(error);

      if (isValidationWatcher)
        for (let i = 0; i < elements.length; i++) {
          elements[i].removeAttribute("disabled");
        }
    })
    .finally(() => {
      if (!isValidationWatcher)
        for (let i = 0; i < elements.length; i++) {
          elements[i].removeAttribute("disabled");
        }
    });
}

export function initValidationWatcher() {
  const formsWithValidationWatcher = document.querySelectorAll<HTMLFormElement>(
    SelectorMap.FormWithValidationWatcher,
  );

  if (formsWithValidationWatcher.length)
    formsWithValidationWatcher.forEach((form) => {
      const submitters = form.querySelectorAll("[type=submit]");

      if (submitters.length)
        submitters.forEach((submitter) =>
          submitter.setAttribute("disabled", ""),
        );

      validateForm(form, (isValid) => {
        if (isValid) {
          if (submitters.length)
            submitters.forEach((submitter) =>
              submitter.removeAttribute("disabled"),
            );
        } else {
          if (submitters.length)
            submitters.forEach((submitter) =>
              submitter.setAttribute("disabled", ""),
            );
        }
      });
    });
}

export function initFieldsWithSearchParams() {
  const fields = document.querySelectorAll<HTMLInputElement>(
    SelectorMap.FieldWithSearchParams,
  );
  const searchParams = Object.fromEntries(
    new URLSearchParams(window.location.search).entries(),
  );

  if (fields.length)
    fields.forEach((field) => {
      const linkedParam = searchParams[field.name];
      if (linkedParam) field.value = linkedParam;
    });
}
