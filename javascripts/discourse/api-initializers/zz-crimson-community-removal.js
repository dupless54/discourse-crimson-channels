import { apiInitializer } from "discourse/lib/api";

const LEGACY_SHELL_UI_SELECTOR = [
  ".cn-server-rail",
  ".cn-mobile-servers-link-item",
  ".cn-member-rail",
  ".cn-mobile-community-backdrop",
  ".cn-mobile-community-toggle-item",
  ".cn-server-button--members",
].join(", ");

function disableLegacyCommunityState() {
  const body = document.body;

  if (!body) {
    return;
  }

  body.classList.add("cn-member-rail-disabled");
  body.classList.remove(
    "cn-member-rail-collapsed",
    "cn-mobile-community-open",
    "cn-user-card-from-member-rail"
  );
  document.documentElement.style.removeProperty("--cn-member-user-card-top");
}

function removeLegacyShellUi() {
  disableLegacyCommunityState();

  for (const element of document.querySelectorAll(LEGACY_SHELL_UI_SELECTOR)) {
    element.remove();
  }

  try {
    window.localStorage.removeItem("cn-member-rail-collapsed");
  } catch {
    // Browser storage is optional; retired shell UI must stay disabled anyway.
  }
}

function scheduleLegacyShellCleanup() {
  removeLegacyShellUi();
  window.setTimeout(removeLegacyShellUi, 0);
  window.setTimeout(removeLegacyShellUi, 250);
  window.setTimeout(removeLegacyShellUi, 750);
  window.setTimeout(removeLegacyShellUi, 1250);
}

export default apiInitializer((api) => {
  scheduleLegacyShellCleanup();
  api.onPageChange(scheduleLegacyShellCleanup);
});
