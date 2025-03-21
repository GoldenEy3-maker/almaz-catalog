export const SelectorMap = {
  Header: "[data-header]",
  HeaderTop: "[data-header-top]",

  // Submenu
  Submenu: "[data-submenu]",
  SubmenuWrapper: "[data-submenu-wrapper]",
  SubmenuTrigger: "[data-submenu-trigger]",

  CartCounter: "[data-cart-counter]",

  // Form
  Form: "[data-form]",
  FormControl: "[data-form-control]",
  FormControlMessage: "[data-form-control-message]",
  FormResponse: "[data-form-response]",
  FormWithValidationWatcher: "[data-form-validation-watcher]",
  FieldWithSearchParams: "[data-field-with-search-params]",

  // Counter
  CounterInput: "[data-counter-input]",
  CounterIncrementTrigger: "[data-counter-increment]",
  CounterDecrementTrigger: "[data-counter-decrement]",

  // Custom Select
  CustomSelectTrigger: "[data-custom-select-trigger]",
  CustomSelect: "[data-custom-select]",
  CustomSelectContent: "[data-custom-select-content]",
  CustomSelectInput: "[data-custom-select-input]",
  CustomSelectSearch: "[data-custom-select-search]",
  CustomSelectOption: "[data-custom-select-option]",
  CustomSelectEmpty: "[data-custom-select-empty]",

  // Suggestions
  SuggestionsAction: "[data-suggestions-action]",
  SuggestionsMenu: "[data-suggestions-menu]",
  SuggestionsMenuContainer: "[data-suggestions-container]",
  SuggestionsMenuItem: "[data-suggestions-item]",
  SuggestionsMenuEmpty: "[data-suggestions-empty]",
  SuggestionsAllResults: "[data-suggestions-all-results]",

  // Equipment
  EquipmentLinksList: "[data-equipment-links-list]",
  EquipmentPartLink: "[data-equipment-part-link]",
  EquipmentSchema: "[data-equipment-schema]",

  // Modal
  ModalOverlay: "[data-modal-overlay]",
  ModalRoot: "[data-modal-root]",
  ModalWrapper: "[data-modal-wrapper]",
  ModalTrigger: "[data-modal-trigger]",
  ModalClose: "[data-modal-close]",

  FocusGuard: "[data-focus-guard]",

  YearMask: "[data-year-mask]",

  AnyFocusableNode:
    "a:not([aria-hidden='true']), button:not([disabled]):not([aria-hidden='true']), input:not([disabled]):not([aria-hidden='true']), [tabindex]:not([disabled]):not([tabindex='-1']):not([aria-hidden='true']), select:not([disabled]):not([aria-hidden='true']), textarea:not([disabled]):not([aria-hidden='true'])",
} as const;
