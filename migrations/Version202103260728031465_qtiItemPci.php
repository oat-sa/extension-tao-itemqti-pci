<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202103260728031465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove Math Entry interaction from PCI registry';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();

        if ($registry->has('mathEntryInteraction')) {
            /* @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('mathEntryInteraction');
        }
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciMathEntry::class
        );
    }
}
