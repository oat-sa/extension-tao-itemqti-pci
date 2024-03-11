<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScaleInteraction;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202403071639280420_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Install/update PCI LikertScaleInteraction';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScaleInteraction()
            )(
                ['0.6.1']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciLikertScaleInteraction::class
        );
    }
}
