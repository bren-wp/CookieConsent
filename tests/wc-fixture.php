<?php
/**
 * Runs via WP-CLI against an actual WooCommerce/MySQL installation.
 * Uses a virtual product and offline BACS gateway: no payment is collected.
 */
if (!defined('ABSPATH') || !class_exists('WooCommerce') || !function_exists('wc_get_product')) {
    fwrite(STDERR, "WooCommerce installation required\n");
    exit(1);
}
update_option('woocommerce_enable_guest_checkout', 'yes');
update_option('woocommerce_currency', 'EUR');
update_option('woocommerce_bacs_settings', [
    'enabled' => 'yes', 'title' => 'Direct bank transfer',
    'description' => 'CI test gateway, no real payment',
    'instructions' => '', 'account_details' => [],
]);
$post = wp_insert_post([
    'post_type'=>'product', 'post_title'=>'Brendigo automated checkout sample',
    'post_content'=>'Non-shipping test item', 'post_status'=>'publish',
], true);
if (is_wp_error($post)) { fwrite(STDERR, $post->get_error_message()); exit(1); }
$product = wc_get_product($post);
$product->set_virtual(true);
$product->set_regular_price('9.99');
$product->set_catalog_visibility('visible');
$product->save();
$cart = wp_insert_post([
  'post_type'=>'page','post_title'=>'BCC Test Cart','post_name'=>'bcc-test-cart',
  'post_status'=>'publish','post_content'=>'[woocommerce_cart]',
], true);
$checkout = wp_insert_post([
  'post_type'=>'page','post_title'=>'BCC Test Checkout','post_name'=>'bcc-test-checkout',
  'post_status'=>'publish','post_content'=>'[woocommerce_checkout]',
], true);
if (is_wp_error($cart) || is_wp_error($checkout)) { fwrite(STDERR, "Page setup failed");exit(1); }
update_option('woocommerce_cart_page_id', $cart);
update_option('woocommerce_checkout_page_id', $checkout);
echo json_encode(['productId'=>$product->get_id(),
    'checkoutId'=>$checkout,'cartId'=>$cart],JSON_THROW_ON_ERROR)."\n";
