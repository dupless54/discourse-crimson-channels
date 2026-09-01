# frozen_string_literal: true

RSpec.describe "Crimson Channels shell" do
  let!(:theme) { upload_theme_or_component }

  it "keeps the retired custom rails and private-server navigation out of the shell" do
    visit("/")

    expect(page).to have_no_css(".cn-server-rail", visible: :all)
    expect(page).to have_no_css(".cn-server-button", visible: :all)
    expect(page).to have_no_css(".cn-mobile-servers-link-item", visible: :all)
    expect(page).to have_no_css(".cn-mobile-servers-link", visible: :all)
    expect(page).to have_no_css("#cn-community-panel", visible: :all)
    expect(page).to have_no_css(".cn-mobile-community-toggle-item", visible: :all)
    expect(page).to have_no_css(".cn-mobile-community-backdrop", visible: :all)
  end

  it "keeps the native Discourse shell available after removing the custom rail" do
    visit("/")

    expect(page).to have_css(".d-header", visible: true)
    expect(page).to have_css("#main-outlet-wrapper", visible: true)
    expect(page).to have_css("#main-outlet", visible: true)
    expect(page).to have_css("body.cn-member-rail-disabled", visible: :all)
  end
end
