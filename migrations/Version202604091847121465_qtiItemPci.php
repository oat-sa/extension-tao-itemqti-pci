<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202604091847121465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update Math Entry PCI: fix MathJax rendering in prompt for creator context';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['3.0.3']
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
