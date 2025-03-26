import Choices from "choices.js";
import { SelectorMap } from "./constants";

export function initCustomSelect() {
  new Choices(SelectorMap.CustomSelect, {
    searchEnabled: false,
    itemSelectText: "",
  });
}
