<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202209141533261465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update the Math Entry PCI, adding support for rendering Math expressions in the prompt';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['2.3.0']
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
