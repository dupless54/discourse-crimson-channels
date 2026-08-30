# frozen_string_literal: true

RSpec.describe "Crimson Channels shell", system: true do
  let!(:theme) { upload_theme_or_component }

  it "renders the shell and structured default navigation" do
    visit("/")

    expect(page).to have_css(".cn-server-rail")
    expect(page).to have_css("#cn-community-panel")
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"]',
      count: 5,
    )
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"][href="/"]',
    )
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"][href="/categories"]',
    )
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"][href="/latest"]',
    )
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"][href="/servers"]',
    )
    expect(page).to have_css(
      '.cn-server-rail a[data-cn-object-navigation="true"][href="/chat"]',
    )
  end

  it "applies administrator shell settings" do
    theme.update_setting(:brand_initial, "CC")
    theme.update_setting(:member_rail_enabled, false)
    theme.save!

    visit("/")

    expect(page).to have_css(".cn-server-button--brand [data-cn-brand-initial]", text: "CC")
    expect(page).to have_css("body.cn-member-rail-disabled", visible: :all)
  end

  it "removes static navigation fallback links when no structured items are visible" do
    theme.update_setting(:navigation_items, [])
    theme.save!

    visit("/")

    expect(page).to have_css(".cn-server-rail")
    expect(page).to have_no_css(".cn-server-rail a.cn-server-button")
  end
end
