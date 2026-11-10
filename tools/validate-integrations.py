#!/usr/bin/env python3
"""Fast, dependency-free syntax and schema validation of CMS integration manifests."""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

xml_files = [
    "joomla/brendigocookieconsent.xml",
    "magento/etc/module.xml", "magento/etc/config.xml",
    "magento/etc/acl.xml", "magento/etc/adminhtml/system.xml",
    "magento/view/frontend/layout/default.xml",
    "prestashop/config.xml",
]
for name in xml_files:
    ET.parse(ROOT / name)
    print("XML:", name)

for name in [
    "opencart/install.json",
    "magento/composer.json",
]:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    assert data["version"], name
    assert "Brendigo" in str(data), name
    print("JSON:", name)

liquid = (ROOT / "shopify/extensions/brendigo-cookieconsent/blocks/consent-banner.liquid").read_text(encoding="utf-8")
schema = re.search(r"{% schema %}([\s\S]+?){% endschema %}", liquid)
assert schema is not None, "Missing Shopify Liquid schema"
settings = json.loads(schema.group(1))
assert settings["target"] == "compliance_head", "Consent must load in compliance_head"
assert all("type" in item and "id" in item for item in settings["settings"])
print("Shopify: valid app embed schema")

# The root of the OpenCart 4 zip must contain its manifest, admin/, and catalog/.
for p in ("opencart/install.json", "opencart/admin/controller/module/cookieconsent.php",
          "opencart/catalog/controller/module/cookieconsent.php",
          "drupal/brendigo_cookieconsent.info.yml",
          "drupal/brendigo_cookieconsent.routing.yml",
          "joomla/services/provider.php"):
    assert (ROOT / p).is_file(), p
print("CMS manifests validated")
