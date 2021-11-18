<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\scripts\install\RegisterPciLiquid;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202111161903531465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Force direction for labels';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        if ($registry->has('liquidsInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('liquidsInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciLiquid()
            )(
                ['0.5.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciLiquid::class
        );
    }
}
