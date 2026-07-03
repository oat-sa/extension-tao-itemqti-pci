<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202605061251001465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update TAO Math Entry PCI: apply gap style on mathEntryInteraction root in gap-expression mode';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['3.0.6']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciMathEntry::class
        );
    }
}
