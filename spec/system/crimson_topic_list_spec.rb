# frozen_string_literal: true

RSpec.describe "Crimson topic list" do
  let!(:theme) { upload_theme_or_component }
  let!(:category) { Fabricate(:category, name: "Oyun Haberleri", color: "12AB34") }
  let!(:topic) { Fabricate(:topic, category: category) }

  before { Fabricate(:post, topic: topic) }

  it "renders the premium topic cell with the author avatar and the topic's own category color" do
    visit("/latest")

    expect(page).to have_css(".topic-list .cn-topic-cell")
    expect(page).to have_css(".cn-topic-cell .cn-topic-cell__author img.avatar")
    expect(page).to have_css(".cn-topic-cell .link-top-line a.raw-topic-link.title")
    expect(page).to have_css(
      ".cn-topic-cell .link-bottom-line .badge-category__wrapper[style*='--category-badge-color: #12AB34']",
    )
  end

  it "keeps the pinned rail indicator scoped to pinned topics" do
    pinned_topic = Fabricate(:topic, category: category, pinned_at: Time.zone.now)
    Fabricate(:post, topic: pinned_topic)

    visit("/latest")

    expect(page).to have_css(".topic-list-item.pinned .cn-topic-cell__rail")
    expect(page).to have_css(".topic-list-item:not(.pinned) .cn-topic-cell__rail")
  end

  context "on mobile", mobile: true do
    it "shows the compact colorful category chip in the native mobile topic row" do
      visit("/latest")

      expect(page).to have_css(
        ".topic-item-stats__category-tags .badge-category__wrapper[style*='--category-badge-color: #12AB34']",
      )
      expect(page).to have_no_css(".cn-topic-cell")
    end
  end
end
