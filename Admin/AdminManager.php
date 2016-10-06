<?php
/**
 * Created by PhpStorm.
 * User: max
 * Date: 01/10/2016
 * Time: 18:53
 */

namespace Mindy\Bundle\AdminBundle\Admin;

use Mindy\Module\ModuleInterface;
use Mindy\Module\ModuleManagerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class AdminManager
 * @package Mindy\Admin
 */
class AdminManager
{
    use ContainerAwareTrait;

    /**
     * @var array|AdminInterface[]
     */
    protected $_admins = [];

    /**
     * AdminManager constructor.
     * @param array $admins
     */
    public function __construct(array $admins = [])
    {
        foreach ($admins as $id => $config) {
            $class = $config['class'];
            unset($config['class']);

            $this->_admins[$id] = (new \ReflectionClass($class))->newInstanceArgs($config);
        }
    }

    /**
     * @return \Symfony\Component\HttpKernel\Kernel
     */
    protected function getKernel()
    {
        return $this->container->get('kernel');
    }

    /**
     * @param string $bundleName
     * @param string $admin
     * @return AdminInterface
     */
    public function getAdmin(string $bundleName, string $admin) : AdminInterface
    {
        $bundles = $this->getKernel()->getBundles();
        if (!array_key_exists($bundleName . 'Bundle', $bundles)) {
            throw new NotFoundHttpException(sprintf(
                "Bundle not found: %sBundle", $bundleName
            ));
        }

        $bundle = $this->getKernel()->getBundle($bundleName . 'Bundle');

        $adminClass = sprintf("%s\\Admin\\%s", $bundle->getNamespace(), $admin);
        if (class_exists($adminClass)) {
            return $this->createAdmin($bundle, $adminClass);
        }

        throw new NotFoundHttpException("Admin class not found");
    }

    /**
     * @param Bundle $bundle
     * @param string $adminClass
     * @return Admin
     */
    protected function createAdmin(Bundle $bundle, string $adminClass)
    {
        /** @var Admin $instance */
        $instance = new $adminClass;
        $instance->setBundle($bundle);
        $instance->setContainer($this->container);
        return $instance;
    }
}