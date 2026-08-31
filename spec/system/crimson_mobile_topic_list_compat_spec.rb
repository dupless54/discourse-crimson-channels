# frozen_string_literal: true

RSpec.describe "Crimson mobile topic-list compatibility", mobile: true do
  before { upload_theme_or_component }

  it "keeps User Cosmetics ambient avatar frames centered on the square avatar box" do
    visit("/")

    page.execute_script <<~JS
      const style = document.createElement("style");
      style.textContent = `
        [data-user-card="frame-test"]:has(img.avatar):not(.main-avatar) {
          position: relative !important;
          display: inline-block !important;
        }
        [data-user-card="frame-test"]:has(img.avatar):not(.main-avatar)::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          aspect-ratio: 1;
          transform: scale(1.28);
          transform-origin: center;
        }
      `;
      document.head.appendChild(style);

      const fixture = document.createElement("div");
      fixture.className = "topic-list";
      fixture.innerHTML = `
        <div class="topic-list-data">
          <div class="pull-left">
            <a data-user-card="frame-test">
              <img class="avatar" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(fixture);
    JS

    frame_host = "document.querySelector('[data-user-card=\"frame-test\"]')"
    frame_style = "getComputedStyle(#{frame_host}, '::after')"

    expect(page.evaluate_script("#{frame_host}.getBoundingClientRect().width")).to eq(36)
    expect(page.evaluate_script("#{frame_host}.getBoundingClientRect().height")).to eq(36)
    expect(page.evaluate_script("#{frame_style}.top")).to eq("0px")
    expect(page.evaluate_script("#{frame_style}.left")).to eq("0px")
    expect(page.evaluate_script("#{frame_style}.right")).to eq("auto")
    expect(page.evaluate_script("#{frame_style}.bottom")).to eq("auto")
  end

  it "keeps overflowing mobile tags readable instead of collapsing them to bullet squares" do
    visit("/")

    page.execute_script <<~JS
      const fixture = document.createElement("div");
      fixture.className = "topic-list";
      fixture.innerHTML = `
        <div class="topic-item-stats" style="width: 260px">
          <span class="topic-item-stats__category-tags">
            <a class="badge-category__wrapper"><span class="badge-category__name">Kategori</span></a>
            <ul class="discourse-tags">
              <li><a class="discourse-tag bullet">forum</a></li>
              <li><a class="discourse-tag bullet">sosyal-medya</a></li>
              <li><a class="discourse-tag bullet">uzun-ucuncu-etiket</a></li>
            </ul>
          </span>
          <div class="num activity">3 g</div>
        </div>
      `;
      document.body.appendChild(fixture);
    JS

    tags = "document.querySelector('.topic-item-stats__category-tags .discourse-tags')"
    first_item = "#{tags}.children[0]"
    second_item = "#{tags}.children[1]"
    third_item = "#{tags}.children[2]"
    first_tag = "#{first_item}.querySelector('.discourse-tag')"

    expect(page.evaluate_script("getComputedStyle(#{tags}).flexWrap")).to eq("nowrap")
    expect(page.evaluate_script("getComputedStyle(#{first_item}).minWidth")).to eq("32px")
    expect(page.evaluate_script("getComputedStyle(#{second_item}).minWidth")).to eq("32px")
    expect(page.evaluate_script("getComputedStyle(#{third_item}).display")).to eq("none")
    expect(page.evaluate_script("getComputedStyle(#{first_tag}, '::before').display")).to eq("none")
    expect(page.evaluate_script("getComputedStyle(#{tags}, '::after').content")).to include("…")
  end
end
