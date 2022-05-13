<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202205130814351465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register Navigation lock plugin';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if (!$registry->isRegistered('qtiItemPci/plugins/controls/navigation/navigationlock')) {
            $registry->register(TestPlugin::fromArray([
                'id' => 'navigationlock',
                'name' => 'Navigation lock',
                'module' => 'qtiItemPci/plugins/controls/navigation/navigationlock',
                'bundle' => 'qtiItemPci/loader/testPlugins.min',
                'description' => 'Disable navigation based on extra requirements',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core' ]
            ]));
        }
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if ($registry->isRegistered('qtiItemPci/plugins/controls/navigation/navigationlock')) {
            $registry->remove('qtiItemPci/plugins/controls/navigation/navigationlock');
        }
    }
}
