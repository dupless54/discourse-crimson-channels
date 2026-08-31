const { execFileSync } = require("child_process");
const path = require("path");

const config = require("@discourse/lint-configs/prettier");

if (
  process.env.CI &&
  process.env.CN_PRETTIER_DUMP_CHILD !== "1" &&
  !globalThis.__cnPrettierDumped
) {
  globalThis.__cnPrettierDumped = true;

  for (const target of [
    "desktop/desktop.scss",
    "stylesheets/crimson-profile.scss",
  ]) {
    const formatted = execFileSync(
      process.execPath,
      [
        require.resolve("prettier/bin/prettier.cjs"),
        "--config",
        path.resolve(__filename),
        target,
      ],
      {
        encoding: "utf8",
        env: { ...process.env, CN_PRETTIER_DUMP_CHILD: "1" },
      }
    );

    console.error(`CN_PRETTIER_BEGIN:${target}\n${formatted}CN_PRETTIER_END:${target}`);
  }
}

module.exports = config;
