/* Magento Brendigo configuration — parse only non-executable JSON. */
(function (root) {
  'use strict';
  var node = root.document.getElementById('brendigo-cookieconsent-config');
  if (!node) return;
  try {
    var data = JSON.parse(node.textContent || '');
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      root.BCC_SITE_CONFIG = data;
    }
  } catch (error) {
    if (root.console) root.console.error('[Brendigo] Invalid Magento consent settings.');
  }
})(window);
