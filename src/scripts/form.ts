import { SelectorMap } from "./constants";

function validateForm(form: HTMLFormElement) {
  const controls = form.querySelectorAll<HTMLDivElement>(
    SelectorMap.FormControl,
  );

  let isValid = true;

  function validateRequired(
    target: HTMLInputElement,
    messageContainer: HTMLParagraphElement | null,
  ) {
    if (target.value === "") {
      isValid = false;
      if (messageContainer) messageContainer.textContent = "Обязательное поле";
      target.ariaInvalid = "true";
    } else {
      if (messageContainer) messageContainer.textContent = "";
      target.ariaInvalid = "false";
    }
  }

  function validatePattern(
    target: HTMLInputElement,
    messageContainer: HTMLParagraphElement | null,
  ) {
    if (!target.value && target.required) return;

    if (!new RegExp(`^(?:${target.pattern})$`).test(target.value)) {
      isValid = false;
      if (messageContainer)
        messageContainer.textContent = target.dataset.patternText ?? null;
      target.ariaInvalid = "true";
      console.log(target.value);
    } else {
      if (messageContainer) messageContainer.textContent = "";
      target.ariaInvalid = "false";
    }
  }

  function validateMinLength(
    target: HTMLInputElement,
    messageContainer: HTMLParagraphElement | null,
  ) {
    if (!target.value) return;

    if (target.value.length < target.minLength) {
      isValid = false;
      if (messageContainer)
        messageContainer.textContent = `Минимальное количество символов поля ${target.minLength}`;
      target.ariaInvalid = "true";
    } else {
      if (messageContainer) messageContainer.textContent = "";
      target.ariaInvalid = "false";
    }
  }

  if (controls.length)
    controls.forEach((control) => {
      const input = control.querySelector<HTMLInputElement>("input");
      const messageContainer = control.querySelector<HTMLParagraphElement>(
        SelectorMap.FormControlMessage,
      );

      if (input?.required !== undefined) {
        validateRequired(input, messageContainer);
        input.addEventListener("input", () =>
          validateRequired(input, messageContainer),
        );
      }

      if (input?.pattern !== undefined && input.pattern !== "") {
        validatePattern(input, messageContainer);
        input.addEventListener("input", () =>
          validatePattern(input, messageContainer),
        );
      }

      if (input?.minLength !== undefined && input.minLength !== -1) {
        validateMinLength(input, messageContainer);
        input.addEventListener("input", () => {
          validateMinLength(input, messageContainer);
        });
      }
    });

  return isValid;
}

export function formSubmitHandler(event: SubmitEvent) {
  event.preventDefault();

  const target = event.target as HTMLFormElement;

  const isValid = validateForm(target);

  const responseContainer = target.querySelector<HTMLParagraphElement>(
    SelectorMap.FormResponse,
  );
  const redirectUrl = target.getAttribute("data-redirect");

  if (!isValid) return;

  const formData = new FormData(target);

  // @ts-expect-error FormData in URLSearchParams constructor
  const urlParams = new URLSearchParams(formData);

  const elements = target.elements;

  for (let i = 0; i < elements.length; i++) {
    (elements[i] as HTMLInputElement | HTMLButtonElement).disabled = true;
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
      body: target.method === "get" ? undefined : formData,
    },
  )
    .then((response) => {
      if (!response.ok) {
        console.error(
          "response error",
          response.url,
          response.status,
          response.statusText,
        );
        if (responseContainer) {
          responseContainer.textContent = "Что-то пошло не так!";
          responseContainer.ariaHidden = "false";
        }
        return;
      }

      target.reset();

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
    })
    .catch((error) => {
      if (responseContainer) {
        responseContainer.textContent = error;
        responseContainer.ariaHidden = "false";
      }
      console.error(error);
    })
    .finally(() => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].removeAttribute("disabled");
      }
    });
}
