# frozen_string_literal: true

RSpec.describe "Crimson Channels mobile shell", mobile: true do
  let!(:theme) { upload_theme_or_component }

  it "does not render the retired private-server shortcut" do
    visit("/")

    expect(page).to have_no_css(".cn-mobile-servers-link-item", visible: :all)
    expect(page).to have_no_css(".cn-mobile-servers-link", visible: :all)
    expect(page).to have_no_css("a[href='/servers'].cn-mobile-servers-link", visible: :all)
  end

  it "does not render the retired Community drawer controls" do
    visit("/")

    expect(page).to have_no_css(".cn-mobile-community-toggle", visible: :all)
    expect(page).to have_no_css(".cn-mobile-community-toggle-item", visible: :all)
    expect(page).to have_no_css(".cn-mobile-community-backdrop", visible: :all)
    expect(page).to have_no_css("#cn-community-panel", visible: :all)
    expect(page).to have_no_css("body.cn-mobile-community-open", visible: :all)
  end
end
