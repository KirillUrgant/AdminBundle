<?php
/**
 * Created by PhpStorm.
 * User: max
 * Date: 01/10/2016
 * Time: 19:06
 */

namespace Mindy\Bundle\AdminBundle\Admin;

use Symfony\Component\HttpFoundation\Response;

/**
 * Interface AdminInterface
 * @package Mindy\Admin
 */
interface AdminInterface
{
    /**
     * @param string $action
     * @return Response
     */
    public function run(string $action) : Response;
}