# frozen_string_literal: true

RSpec.describe "Crimson topic list" do
  let!(:theme) { upload_theme_or_component }
  let!(:category) { Fabricate(:category, name: "Oyun Haberleri", color: "12AB34") }
  let!(:topic) { Fabricate(:topic, category: category) }

  before { Fabricate(:post, topic: topic) }

  it "renders the outlet-injected author avatar beside the native topic cell, with the topic's own category color" do
    visit("/latest")

    cell = ".topic-list td.main-link.topic-list-data"
    expect(page).to have_css("#{cell} .cn-topic-cell__author img.avatar")
    expect(page).to have_css("#{cell} .link-top-line a.raw-topic-link.title")
    expect(page).to have_css(
      "#{cell} .link-bottom-line .badge-category__wrapper[style*='--category-badge-color: #12AB34']",
    )
  end

  it "keeps the topic avatar and its user-link wrapper on the same square reference box" do
    geometry_for = lambda do
      page.evaluate_script(<<~JS)
        (() => {
          const wrapper = document.querySelector(".cn-topic-cell__author");
          const avatar = wrapper.querySelector("img.avatar");
          const wrapperRect = wrapper.getBoundingClientRect();
          const avatarRect = avatar.getBoundingClientRect();

          return [
            wrapperRect.width,
            wrapperRect.height,
            avatarRect.width,
            avatarRect.height,
            avatarRect.left - wrapperRect.left,
            avatarRect.top - wrapperRect.top,
          ];
        })()
      JS
    end

    page.current_window.resize_to(1366, 900)
    visit("/latest")

    expect(geometry_for.call).to eq([42, 42, 42, 42, 0, 0])

    page.current_window.resize_to(1440, 900)

    expect(geometry_for.call).to eq([46, 46, 46, 46, 0, 0])
  end

  it "shows the pinned accent only on pinned topic rows" do
    pinned_topic = Fabricate(:topic, category: category, pinned_at: Time.zone.now)
    Fabricate(:post, topic: pinned_topic)

    visit("/latest")

    pinned_background =
      page.evaluate_script(
        "getComputedStyle(document.querySelector('.topic-list-item.pinned td.main-link'), '::before').backgroundColor",
      )
    unpinned_background =
      page.evaluate_script(
        "getComputedStyle(document.querySelector('.topic-list-item:not(.pinned) td.main-link'), '::before').backgroundColor",
      )

    expect(pinned_background).not_to eq("rgba(0, 0, 0, 0)")
    expect(unpinned_background).to eq("rgba(0, 0, 0, 0)")
  end

  context "when viewed on mobile", mobile: true do
    it "shows the compact colorful category chip in the native mobile topic row, without the desktop avatar connector" do
      visit("/latest")

      expect(page).to have_css(
        ".topic-item-stats__category-tags .badge-category__wrapper[style*='--category-badge-color: #12AB34']",
      )
      expect(page).to have_no_css(".cn-topic-cell__author")
    end
  end
end
