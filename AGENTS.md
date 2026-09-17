# AGENTS.md — extension-tao-itemqti-pci (qtiItemPci)

> Shared pillars (standards, quality / `pr-ready-gate`, Make, commit/PR):
> [nextgen-stack `tao/AGENTS.md`](https://github.com/oat-sa/nextgen-stack/blob/main/tao/AGENTS.md)
> · local: [`../AGENTS.md`](../AGENTS.md).

## 01 — Project Context

**What / why:** `oat-sa/extension-tao-itemqti-pci` (id `qtiItemPci`) owns **PCI**
packs, PCI Manager UI, and the client provider registering portable custom
interactions with QTI.

Extends `taoQtiItem` portable-element layer. **Not** the Creator shell. Usually
**no** `views/package.json` — FE is in-repo.

**Key directories / stack / constraints:**

```text
manifest.php
controller/PciLoader.php, PciManager.php
model/PciModel.php, IMSPciModel.php, …
views/js/pciManager/
views/js/pciCreator/{dev,ims}/
views/js/pciProvider.js
views/js/loader/qtiItemPci.min.js
migrations/
test/
```

Settings → `/qtiItemPci/PciManager/index`; provider → `qtiItemPci/pciProvider`.

- Stack: PHP on itemqti/tao-core; FE fully in-repo.
- Versions from composer/CI.

**Docs:** [`README.md`](README.md). Shared docs / decision-log rules → parent AGENTS.

## 02 — Standards & Conventions

Package-only below. Family patterns, quality SoT, `pr-ready-gate`, polar-star →
**parent AGENTS**.

**Patterns / structure:**

- Register via install scripts + provider; additive PCI migrations.

**Never do (this package):**

- Bypass CustomInteractionRegistry; move Creator shell here.
- Hand-edit PCI loader; one-off registration hacks.

**Ownership**

| Surface | Own? |
|---------|------|
| PCI Manager | **Yes** |
| Built-in PCI creators | **Yes** |
| QTI Creator host | **No** |

## 03 — Build & Test Commands

Shared Make / CI / readiness / commit policy → **parent AGENTS**
([commit/PR policy](https://oat-sa.atlassian.net/wiki/x/_oXmqQ)).

**This package** (from Composer platform root):

```bash
./vendor/bin/phpunit -c phpunit.xml.dist qtiItemPci/test
npx grunt eslint:extensionreport --extension=qtiItemPci --force
npx grunt taobundle --extension=qtiItemPci
```
