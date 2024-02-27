<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202402231520001465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update PCI LikertScaleInteraction (to IMS-compatible version)';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        if ($registry->has('likertScaleInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('likertScaleInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScale()
            )(
                ['1.0.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciLikertScale::class
        );
    }
}
