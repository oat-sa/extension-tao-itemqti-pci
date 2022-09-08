<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202209081219491465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Update the Math Entry PCI reverting a bad fix that broke the compliance to IMS standard';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['2.1.1']
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