# frozen_string_literal: true

RSpec.describe "Crimson discovery", system: true do
  let!(:theme) { upload_theme_or_component }
  let!(:category) do
    Fabricate(
      :category_with_definition,
      name: "Premium Tasarım",
      description: "Masaüstü, tablet ve mobil tasarım konuşmaları",
      color: "A84F6A",
    )
  end
  let!(:tag) { Fabricate(:tag, name: "premium-tasarim") }

  before do
    SiteSetting.tagging_enabled = true
    Fabricate(:topic, category: category, tags: [tag])
  end

  it "keeps native category-box markup and applies the premium card surface" do
    SiteSetting.desktop_category_page_style = "categories_boxes"

    visit "/categories"

    selector = ".category-box[data-category-id='#{category.id}']"
    expect(page).to have_css("#{selector} .parent-box-link", text: category.name)
    display = page.evaluate_script("getComputedStyle(document.querySelector('#{selector}')).display")
    radius =
      page.evaluate_script(
        "getComputedStyle(document.querySelector('#{selector}')).borderTopLeftRadius",
      )

    expect(display).to eq("flex")
    expect(radius).not_to eq("0px")
  end

  it "keeps the native category table semantic at tablet width without horizontal overflow" do
    SiteSetting.desktop_category_page_style = "categories_with_featured_topics"

    visit "/categories"
    page.current_window.resize_to(820, 1024)

    expect(page).to have_css("table.category-list tr[data-category-id='#{category.id}']")
    fits_list_area =
      page.evaluate_script(
        "document.querySelector('table.category-list').getBoundingClientRect().right <= " \
          "document.querySelector('#list-area').getBoundingClientRect().right + 1",
      )

    expect(fits_list_area).to eq(true)
  end

  it "uses a fluid native tag grid instead of fixed floated boxes" do
    visit "/tags"

    selector = ".tags-list .tag-box:has([data-tag-name='#{tag.name}'])"
    expect(page).to have_css(selector)
    display = page.evaluate_script("getComputedStyle(document.querySelector('.tags-list')).display")
    float =
      page.evaluate_script(
        "getComputedStyle(document.querySelector(\"#{selector}\")).float",
      )

    expect(display).to eq("grid")
    expect(float).to eq("none")
  end

  context "when viewed on mobile", mobile: true do
    it "renders category boxes as one readable, non-overflowing column" do
      SiteSetting.mobile_category_page_style = "categories_boxes"

      visit "/categories"

      expect(page).to have_css(".category-box[data-category-id='#{category.id}']")
      fits_list_area =
        page.evaluate_script(
          "document.querySelector('.category-boxes').getBoundingClientRect().width <= " \
            "document.querySelector('#list-area').getBoundingClientRect().width + 1",
        )

      expect(fits_list_area).to eq(true)
    end
  end
end
