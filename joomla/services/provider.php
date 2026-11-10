<?php
defined('_JEXEC') or die;

use Brendigo\Plugin\System\CookieConsent\Extension\CookieConsent;
use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;

return new class implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        $container->set(PluginInterface::class, function (Container $container): PluginInterface {
            $plugin = new CookieConsent(
                $container->get(DispatcherInterface::class),
                (array) PluginHelper::getPlugin('system', 'brendigocookieconsent')
            );
            $plugin->setApplication(Factory::getApplication());
            return $plugin;
        });
    }
};
