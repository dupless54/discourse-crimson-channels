# frozen_string_literal: true

RSpec.describe "Crimson topic reading" do
  let!(:theme) { upload_theme_or_component }
  let!(:topic) { Fabricate(:topic) }
  let!(:post) do
    Fabricate(
      :post,
      topic: topic,
      raw: <<~RAW,
        [quote="Jane"]
        A quoted reply worth reading twice.
        [/quote]

        Here is a snippet:

        ```ruby
        puts "hello world"
        ```
      RAW
    )
  end

  it "styles quote blocks and code blocks through the cooked-content hooks core preserves" do
    visit(topic.url)

    expect(page).to have_css("#topic .cooked aside.quote .title", text: "Jane")
    expect(page).to have_css("#topic .cooked aside.quote blockquote", text: /quoted reply/i)
    expect(page).to have_css("#topic .cooked pre code.lang-ruby", text: /hello world/)
  end
end
