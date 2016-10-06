<?php
/**
 * Created by PhpStorm.
 * User: max
 * Date: 01/10/2016
 * Time: 19:12
 */

namespace Mindy\Bundle\AdminBundle\Admin;

use Exception;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class Admin
 * @package Mindy\Admin
 */
abstract class BaseAdmin implements AdminInterface
{
    use ContainerAwareTrait;

    /**
     * @var Bundle
     */
    protected $bundle;

    /**
     * Default admin template paths for easy override
     * @var array
     */
    public $paths = [
        '{bundle}/admin/{admin}/{view}',
        'admin/{bundle}/{admin}/{view}',
        'admin/admin/{view}',
        'admin/{view}'
    ];

    protected $request;

    /**
     * @param $route
     * @param array $params
     * @return string
     */
    public function reverse($route, array $params = [])
    {
        return $this->container->get('router')->generate($route, $params);
    }

    /**
     * @param $name
     * @return string
     */
    public static function normalizeName($name) : string
    {
        return trim(strtolower(preg_replace('/(?<![A-Z])[A-Z]/', ' \0', $name)), '_ ');
    }

    public function getBundle()
    {
        return $this->bundle;
    }

    /**
     * Shortcut for generate admin urls
     * @param $action
     * @param array $params
     * @return string
     */
    public function getAdminUrl($action, array $params = [])
    {
        $url = $this->reverse('admin_dispatch', [
            'bundle' => $this->getBundle()->getName(),
            'admin' => $this->classNameShort(),
            'action' => $action
        ]);
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        return $url;
    }

    /**
     * @param string $action
     * @return Response
     */
    public function run(string $action) : Response
    {
        if ($this->hasAction($action)) {
            return $this->runInternal($action);
        }

        throw new NotFoundHttpException(sprintf("Action %s not found in %s", $action, get_class($this)));
    }

    /**
     * @param string $action
     * @return mixed
     */
    protected function runInternal(string $action)
    {
        $method = new \ReflectionMethod($this, $action . 'Action');
        return $method->invoke($this);
    }

    /**
     * @param $action
     * @return bool
     */
    protected function hasAction($action) : bool
    {
        return method_exists($this, $action . 'Action');
    }

    /**
     * @param $view
     * @param bool $throw
     * @return null|string
     * @throws Exception
     */
    public function findTemplate($view, $throw = true)
    {
        $bundleName = $this->getBundle()->getName();
        $paths = array_map(function ($path) use ($bundleName, $view) {
            return strtr($path, [
                '{bundle}' => strtolower(str_replace('Bundle', '', $bundleName)),
                '{admin}' => strtolower($this->normalizeString(str_replace('Admin', '', $this->classNameShort()))),
                '{view}' => $view
            ]);
        }, $this->paths);

        $template = $this->container->get('template.finder.chain')->findIn($paths);
        if ($template === null && $throw) {
            throw new Exception('Template not found: ' . $view . '. Paths: ' . implode(' ', $paths));
        }

        return $template;
    }

    /**
     * @return string
     */
    public function classNameShort() : string
    {
        $reflect = new \ReflectionClass($this);
        return $reflect->getShortName();
    }

    /**
     * @param $str
     * @return string
     */
    protected function normalizeString($str)
    {
        return trim(strtolower(preg_replace('/(?<![A-Z])[A-Z]/', '_\0', $str)), '_');
    }

    /**
     * @param Bundle $bundle
     */
    public function setBundle(Bundle $bundle)
    {
        $this->bundle = $bundle;
    }

    public function getRequest() : Request
    {
        /** @var \Symfony\Component\HttpFoundation\RequestStack $requestStack */
        $requestStack = $this->container->get('request_stack');
        return $requestStack->getCurrentRequest();
    }

    /**
     * @param string $template
     * @param array $data
     * @return string
     */
    public function render(string $template, array $data = [])
    {
        return $this->container->get('template')->render($template, array_merge($data, [
            'admin' => $this,
            'bundle' => $this->bundle,
            'adminMenu' => $this->fetchAdminMenu()
        ]));
    }

    protected function fetchAdminMenu()
    {
        if ($this->container->hasParameter('admin.admin_menu')) {
            return $this->container->getParameter('admin.admin_menu');
        } else {
            return [];
        }
    }
}