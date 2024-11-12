import IMask from "imask";

export function yearMaskHandler(input: HTMLInputElement) {
  IMask(input, {
    mask: "0000",
  });
}
