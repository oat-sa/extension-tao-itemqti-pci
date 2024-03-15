<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScore;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202402231420400684_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Install PCI LikertScoreInteraction (IMS-compatible version)';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScore()
            )(
                ['1.0.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciLikertScore::class
        );
    }
}
