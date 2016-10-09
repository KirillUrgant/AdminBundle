<?php
/**
 * Created by PhpStorm.
 * User: max
 * Date: 05/10/2016
 * Time: 20:36
 */

namespace Mindy\Bundle\AdminBundle\Controller;

use Mindy\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    public function indexAction()
    {
        $html = $this->render('admin/index.html', [
            'adminMenu' => $this->get('admin.menu')->getMenu()
        ]);
        return $this->preventCache(new Response($html));
    }

    protected function preventCache(Response $response)
    {
        $response->headers->addCacheControlDirective('no-cache', true);
        $response->headers->addCacheControlDirective('max-age', 0);
        $response->headers->addCacheControlDirective('must-revalidate', true);
        $response->headers->addCacheControlDirective('no-store', true);
        return $response;
    }

    public function dispatchAction($bundle, $admin, $action)
    {
        /** @var \Mindy\Bundle\AdminBundle\Admin\AdminManager $adminManager */
        $adminManager = $this->get('admin');
        $instance = $adminManager->getAdmin($bundle, $admin);
        return $this->preventCache($instance->run($action));
    }

    public function loginAction()
    {
        return new Response('todo');
    }

    public function logoutAction()
    {
        return new Response('todo');
    }

    public function recoverAction()
    {
        return new Response('todo');
    }
}