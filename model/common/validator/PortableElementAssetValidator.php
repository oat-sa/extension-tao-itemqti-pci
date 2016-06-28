<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 24/06/2016
 * Time: 17:19
 */
namespace oat\qtiItemPci\model\common\validator;

use oat\qtiItemPci\model\common\model\PortableElementModel;
use oat\qtiItemPci\model\common\PortableElementModelTrait;
use oat\tao\model\ClientLibRegistry;

abstract class PortableElementAssetValidator implements Validatable
{
    use PortableElementModelTrait;

    public function __construct(PortableElementModel $model=null)
    {
        if ($model) {
            $this->setModel($model);
        }
    }

    public function validateAssets($source, $files=null)
    {
        if (!$files) {
            $files = $this->getRequiredAssets();
        }

        if (empty($files)) {
            return false;
        }

        foreach ($files as $key => $file) {
            try {
                $this->validFile($source, $file);
            } catch (\common_Exception $e) {
                throw new \common_Exception('Invalid file for ' . $key . ': ' . $file, 0, $e);
            }
        }
        return true;
    }

    public function getRequiredAssets()
    {
        $assets = ['runtime' => $this->getModel()->getRuntime()];
        if (!empty($this->getModel()->getCreator())) {
            $assets['creator'] = $this->getModel()->getCreator();
        }

        $files = [];
        foreach ($assets as $key => $asset) {
            $constraints = $this->getAssetConstraints($key);
            foreach ($constraints as $constraint) {
                if (!isset($asset[$constraint])) {
                    if ($this->isOptionalConstraint($key, $constraint)) {
                        continue;
                    }
                    throw new \common_Exception('Missing asset file for ' . $key . ':' . $constraint);
                }
                if (is_array($asset[$constraint])) {
                    $files = array_merge($files, $asset[$constraint]);
                } else {
                    $files[] = $asset[$constraint];
                }
            }
        }
        return $files;
    }

    public function validFile($source, $file)
    {
        if (!file_exists($source)) {
            throw new \common_Exception('Unable to locate extracted zip file.');
        }

        $filePath = $source . $file;
        if (file_exists($filePath) || file_exists($filePath . '.js')) {
            return true;
        }

        if (array_key_exists($file, ClientLibRegistry::getRegistry()->getLibAliasMap())) {
            return true;
        }
        throw new \common_Exception('Asset ' . $file . ' is not found in archive neither through alias');
    }
}