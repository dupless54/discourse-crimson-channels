# frozen_string_literal: true

RSpec.describe "Crimson user card cosmetics compatibility" do
  before { upload_theme_or_component }

  it "preserves the User Cosmetics local profile-effect stacking contract" do
    visit("/")

    expect(page).to have_css("#user-card.user-card", visible: :all)

    page.execute_script(
      "const card = document.querySelector('#user-card.user-card'); card.parentElement.classList.add('duc-profile-effect-host'); card.classList.add('duc-profile-effect-card');",
    )

    card_z_index =
      page.evaluate_script(
        "getComputedStyle(document.querySelector('#user-card.user-card')).zIndex",
      )

    expect(card_z_index).to eq("1")
  end
end
