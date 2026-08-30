# frozen_string_literal: true

RSpec.describe "Crimson channel sections" do
  let!(:theme) { upload_theme_or_component }

  before { SiteSetting.navigation_menu = "sidebar" }

  it "renders configured channels through the native Discourse sidebar" do
    theme.update_setting(
      :channel_sections,
      [
        {
          enabled: true,
          title: "Topluluk",
          collapsed_by_default: false,
          visibility: "everyone",
          channels: [
            {
              enabled: true,
              label: "Son konular",
              url: "/latest",
              icon: "clock",
              visibility: "everyone",
              badge_text: "NEW",
            },
            {
              enabled: true,
              label: "Harici",
              url: "https://example.com/outside",
              icon: "link",
              visibility: "everyone",
            },
          ],
        },
      ],
    )
    theme.save!

    visit("/")

    section = ".sidebar-section[data-section-name='crimson-channel-section-0']"
    expect(page).to have_css("#{section} .sidebar-section-header-text", text: /topluluk/i)
    expect(page).to have_css(
      "#{section} a[data-link-name='crimson-channel-0-0'][href='/latest']",
      text: "Son konular",
    )
    expect(page).to have_css("#{section} .sidebar-section-link-content-badge", text: "NEW")
    expect(page).to have_no_css("#{section} [data-link-name='crimson-channel-0-1']")
  end

  it "shows nested group-restricted channels only to matching members" do
    group = Fabricate(:group)
    member = Fabricate(:user)
    group.add(member)

    theme.update_setting(
      :channel_sections,
      [
        {
          enabled: true,
          title: "Üye Kanalları",
          collapsed_by_default: false,
          visibility: "everyone",
          channels: [
            {
              enabled: true,
              label: "Genel",
              url: "/categories",
              icon: "list",
              visibility: "everyone",
            },
            {
              enabled: true,
              label: "Özel",
              url: "/latest",
              icon: "lock",
              visibility: "groups",
              groups: [group.id],
            },
          ],
        },
      ],
    )
    theme.save!

    visit("/")

    expect(page).to have_css("[data-link-name='crimson-channel-0-0']", text: "Genel")
    expect(page).to have_no_css("[data-link-name='crimson-channel-0-1']")

    sign_in(member)
    visit("/")

    expect(page).to have_css("[data-link-name='crimson-channel-0-1']", text: "Özel")
  end

  it "shows group-restricted sections only to matching members" do
    group = Fabricate(:group)
    member = Fabricate(:user)
    group.add(member)

    theme.update_setting(
      :channel_sections,
      [
        {
          enabled: true,
          title: "Gizli Bölüm",
          collapsed_by_default: false,
          visibility: "groups",
          groups: [group.id],
          channels: [
            {
              enabled: true,
              label: "Gizli Kanal",
              url: "/latest",
              icon: "lock",
              visibility: "everyone",
            },
          ],
        },
      ],
    )
    theme.save!

    visit("/")

    expect(page).to have_no_css(
      ".sidebar-section[data-section-name='crimson-channel-section-0']",
    )

    sign_in(member)
    visit("/")

    expect(page).to have_css(
      ".sidebar-section[data-section-name='crimson-channel-section-0']",
    )
    expect(page).to have_css("[data-link-name='crimson-channel-0-0']", text: "Gizli Kanal")
  end
end
