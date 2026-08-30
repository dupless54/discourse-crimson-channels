# frozen_string_literal: true

RSpec.describe "Crimson Channels mobile shell", mobile: true do
  let!(:theme) { upload_theme_or_component }

  it "maps the structured mobile shortcut to the configured server route" do
    visit("/")

    expect(page).to have_css(".cn-mobile-servers-link", visible: true)
    expect(page).to have_css(".cn-mobile-servers-link[href='/servers']", visible: true)
  end

  it "opens and closes the community drawer from the header toggle" do
    visit("/")

    toggle = find(".cn-mobile-community-toggle", visible: true)
    expect(toggle["aria-expanded"]).to eq("false")

    toggle.click

    expect(page).to have_css("body.cn-mobile-community-open", visible: :all)
    expect(page).to have_css(".cn-mobile-community-toggle[aria-expanded='true']", visible: true)

    toggle.click

    expect(page).to have_no_css("body.cn-mobile-community-open", visible: :all)
    expect(page).to have_css(".cn-mobile-community-toggle[aria-expanded='false']", visible: true)
  end
end
