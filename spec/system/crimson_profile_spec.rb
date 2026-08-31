# frozen_string_literal: true

RSpec.describe "Crimson profile" do
  let!(:theme) { upload_theme_or_component }
  let!(:user) { Fabricate(:user, username: "premium_profile", name: "Premium Profile") }

  it "keeps native profile structure and applies the premium hierarchy" do
    visit(user.path)

    expect(page).to have_css(".user-main .about .user-profile-avatar img.avatar")
    expect(page).to have_css(".user-main .about .primary-textual", text: user.name)
    expect(page).to have_css(".user-main .user-navigation")

    selector = ".user-main .about.no-background .user-profile-image"
    node = "document.querySelector('#{selector}')"
    background = page.evaluate_script("getComputedStyle(#{node}).backgroundImage")

    expect(background).not_to eq("none")
  end

  it "keeps the cosmetic nameplate anchor on the native collapsed profile" do
    visit("#{user.path}/activity")

    selector = ".cn-profile-nameplate-host > .cn-profile-nameplate-layer"
    expect(page).to have_css("#{selector}[data-user-card='#{user.username}']", visible: :all)
    expect(page).to have_css(".about.collapsed-info .user-profile-avatar img.avatar")
  end

  it "fits the profile and navigation inside an 820px tablet viewport" do
    page.current_window.resize_to(820, 1024)
    visit(user.path)

    document_width = page.evaluate_script("document.documentElement.scrollWidth")
    viewport_width = page.evaluate_script("window.innerWidth")

    expect(page).to have_css(".user-main .user-navigation")
    expect(document_width <= viewport_width + 1).to eq(true)
  end

  context "when viewed on mobile", mobile: true do
    it "keeps the avatar, controls, and content in one non-overflowing profile" do
      visit(user.path)

      document_width = page.evaluate_script("document.documentElement.scrollWidth")
      viewport_width = page.evaluate_script("window.innerWidth")

      expect(page).to have_css(".user-main .about .user-profile-avatar img.avatar")
      expect(page).to have_css(".user-main .about .controls")
      expect(document_width <= viewport_width + 1).to eq(true)
    end
  end
end
