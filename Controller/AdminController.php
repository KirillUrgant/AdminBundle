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
        // $menu = $this->getModule()->fetchAdminMenu();
        $menu = [];
        $html = $this->render('admin/index.html', [
            'menu' => $menu
        ]);
        return new Response($html);
    }

    public function dispatchAction($bundle, $admin, $action)
    { 
        /** @var \Mindy\Bundle\AdminBundle\Admin\AdminManager $adminManager */
        $adminManager = $this->get('admin');
        $instance = $adminManager->getAdmin($bundle, $admin);
        return $instance->run($action);
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