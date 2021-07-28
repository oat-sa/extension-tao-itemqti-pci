<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\scripts\tools\accessControl\SetRolesAccess;
use oat\taoItems\model\user\TaoItemsRoles;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202107271111381465_qtiItemPci extends AbstractMigration
{

    private const CONFIG = [
        SetRolesAccess::CONFIG_RULES => [
            TaoItemsRoles::ITEM_CONTENT_CREATOR => [
                ['ext' => 'qtiItemPci', 'mod' => 'PciLoader', 'act' => 'load']
            ],
        ]
    ];

    public function getDescription(): string
    {
        return 'Item content creator role to author existing item';
    }

    public function up(Schema $schema): void
    {
        $setRolesAccess = $this->propagate(new SetRolesAccess());
        $setRolesAccess(
            [
                '--' . SetRolesAccess::OPTION_CONFIG,
                self::CONFIG,
            ]
        );
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException(
            'This role should have been applied in the past, so we should not roll it back'
        );
    }
}
