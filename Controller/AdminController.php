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
        dump($this->get('translator')->trans('hello', [], 'AdminBundle.messages'));
        $html = $this->render('admin/index.html');
        return new Response($html);
    }

    public function dispatchAction($bundle, $admin, $action)
    {
        return new Response(sprintf(
            "%s %s %s", $bundle, $admin, $action
        ));
    }
}