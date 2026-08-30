# frozen_string_literal: true

# Keep the current Discourse skeleton smoke suite intact so the theme cannot
# silently break core login, topic, profile, or search behavior.
RSpec.describe "Core features" do
  before { upload_theme_or_component }

  it_behaves_like "having working core features"
end
