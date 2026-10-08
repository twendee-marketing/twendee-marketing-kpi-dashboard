# Twendee Marketing KPI Dashboard

Private source repository for the weekly KPI dashboard. Notion is the source of truth.

## Notion pages
- [Overview](https://app.notion.com/p/3f3ad5e565f981f48c94fd9506073be2)
- [Weekly Reports](https://app.notion.com/p/74f97551213645498025c83773539ef2)
- [KPI Records](https://app.notion.com/p/6fc8d546d32a485b9ed4e0f43102259d)

## Setup
1. Create a Notion internal integration with **Read content** access and invite it to the overview and both databases.
2. Add `NOTION_TOKEN` to repository **Settings → Secrets and variables → Actions**. Never commit or paste the token into HTML.
3. Workflow `Validate Notion KPI data` can be run manually and hourly. It checks both sources and writes `data/kpi.json` **only in the private runner**.
4. Data remains private by default. The public-site deployment workflow is intentionally **not enabled**.

## Privacy
GitHub Pages and published `data/kpi.json` would expose KPI figures to visitors even if this repository is private. **Do not publish the generated JSON publicly without explicit approval.** For private internal reporting choose an authenticated host instead.

## Report creation
Create a Weekly Reports page with a unique Reporting Period such as `2026-W42`. Add associated KPI Records with the identical period. Missing Actual stays blank; confirmed zero must be 0. Keep duplicate Section + Account + Metric combinations out of each period.

The dashboard shell displays no private baseline data. You can preview locally by importing an authorized Notion CSV.