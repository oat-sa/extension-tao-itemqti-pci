<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202102011314151465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert Math Entry interaction to IMS compliant';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();

        if ($registry->has('mathEntryInteraction')) {
            /* @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('mathEntryInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['1.0.0']
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
