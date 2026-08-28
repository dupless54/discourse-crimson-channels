# Validation Commands

Use the narrowest relevant check first. Not run = `NOT_RUN`; no workflow result = `NO_CI`.

Verified bootstrap checks:
```bash
ruby -rjson -e 'JSON.parse(File.read("about.json"))'
ruby -ryaml -e 'YAML.safe_load(File.read("settings.yml"), aliases: true)'
ruby -ryaml -e 'Dir["locales/*.yml"].each { |f| YAML.safe_load(File.read(f), aliases: true) }'
node --check javascripts/discourse/api-initializers/crimson-channels.js
```

Repository CI:
- `.github/workflows/discourse-theme.yml` delegates to `discourse/.github/.github/workflows/discourse-theme.yml@v1`.
- Exact latest PR/main head must be GREEN before claiming CI success.

Runtime validation when a Discourse test site is available:
- desktop + mobile
- light + dark
- homepage/latest/categories/topic/profile/chat/server-list routes
- Crimson Community installed and absent/failing (graceful degradation)
- user-card clicks/hover, featured topics, member rail, profile visitor rail
