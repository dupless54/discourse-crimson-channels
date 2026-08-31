import { apiInitializer } from "discourse/lib/api";

const LEGACY_COMMUNITY_UI_SELECTOR = [
  ".cn-member-rail",
  ".cn-mobile-community-backdrop",
  ".cn-mobile-community-toggle-item",
  ".cn-server-button--members",
].join(", ");

function removeLegacyCommunityUi() {
  const body = document.body;

  if (!body) {
    return;
  }

  if (!body.classList.contains("cn-member-rail-disabled")) {
    body.classList.add("cn-member-rail-disabled");
  }

  body.classList.remove(
    "cn-member-rail-collapsed",
    "cn-mobile-community-open",
    "cn-user-card-from-member-rail"
  );

  document.documentElement.style.removeProperty("--cn-member-user-card-top");

  for (const element of document.querySelectorAll(
    LEGACY_COMMUNITY_UI_SELECTOR
  )) {
    element.remove();
  }

  try {
    window.localStorage.removeItem("cn-member-rail-collapsed");
  } catch {
    // Browser storage is optional; the removed rail must stay disabled anyway.
  }
}

export default apiInitializer((api) => {
  removeLegacyCommunityUi();

  const observer = new MutationObserver(() => removeLegacyCommunityUi());

  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
  }

  api.onPageChange(() => {
    window.requestAnimationFrame(removeLegacyCommunityUi);
  });
});
