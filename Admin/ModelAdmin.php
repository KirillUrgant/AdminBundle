<?php
/**
 * Created by PhpStorm.
 * User: max
 * Date: 06/10/16
 * Time: 11:31
 */

namespace Mindy\Bundle\AdminBundle\Admin;

use Doctrine\Common\Inflector\Inflector;
use Mindy\Orm\ModelInterface;
use function Mindy\trans;

/**
 * Class ModelAdmin
 * @package Mindy\Bundle\AdminBundle\Admin
 */
abstract class ModelAdmin extends Admin
{
    /**
     * @var array
     */
    public $permissions = [
        'create' => true,
        'update' => true,
        'info' => true,
        'remove' => true
    ];

    /**
     * @param $code
     * @return bool
     */
    public function can($code)
    {
        $defaultPermissions = [
            'create' => true,
            'update' => true,
            'info' => true,
            'remove' => true
        ];
        $permissions = array_merge($defaultPermissions, $this->permissions);
        return isset($permissions[$code]) && $permissions[$code];
    }

    /**
     * @param ModelInterface|null $instance
     * @return array
     */
    public function getAdminNames(ModelInterface $instance = null)
    {
        $classMap = explode('\\', $this->getModelClass());
        $name = self::normalizeName(end($classMap));

        $bundleName = $this->getBundle()->getName();
        return [
            trans(
                ucfirst(Inflector::pluralize($name)), [], sprintf('%s.admin', $bundleName)
            ),
            trans(
                sprintf('Create %s', $name),
                [],
                sprintf('%s.admin', $bundleName)
            ),
            trans(
                sprintf('Update %s: %s', $name, '%name%'),
                ['name' => (string)$instance],
                sprintf('%s.admin', $bundleName)
            ),
        ];
    }

    /**
     * Array of action => name, where actions is an
     * action in this admin class
     * @return array
     */
    public function getActions()
    {
        return $this->can('remove') ? [
            'batchRemove' => trans('Remove', [], 'AdminBundle.messages'),
        ] : [];
    }

    /**
     * @return string model class name
     */
    abstract public function getModelClass();

    public function getOrderUrl($column)
    {
        $request = $this->getRequest();
        $data = $request->query->all();
        if (isset($data['order']) && $data['order'] == $column) {
            $column = '-' . $column;
        }
        $queryString = http_build_query(array_merge($data, ['order' => $column]));
        return strtok($request->getPathInfo(), '?') . '?' . $queryString;
    }

    /**
     * @param ModelInterface $model
     * @param $action
     * @return array
     */
    public function fetchBreadcrumbs(ModelInterface $model, $action)
    {
        list($list, $create, $update) = $this->getAdminNames($model);
        $breadcrumbs = [
            ['name' => $list, 'url' => $this->getAdminUrl('list')]
        ];
        $custom = $this->getCustomBreadrumbs($model, $action);
        if (!empty($custom)) {
            // Fetch user custom breadcrumbs
            $breadcrumbs = array_merge($breadcrumbs, $custom);
        }

        $bundleName = $this->getBundle()->getName();
        switch ($action) {
            case 'create':
                $breadcrumbs[] = ['name' => $create];
                break;
            case 'update':
                $breadcrumbs[] = ['name' => $update];
                break;
            case 'list':
                break;
            case 'info':
                $breadcrumbs[] = [
                    'name' => trans('Information about: %name%', ['%name%' => (string)$model], sprintf('%s.admin', $bundleName)),
                    'url' => $this->getAdminUrl('list')
                ];
                break;
            default:
                break;
        }

        return $breadcrumbs;
    }
}