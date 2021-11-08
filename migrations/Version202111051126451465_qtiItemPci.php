<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;
use oat\qtiItemPci\model\PciModel;


/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202111051126451465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Update Likert Scale interaction';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        if ($registry->has('likertScaleInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('likertScaleInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScale()
            )(
                ['0.6.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        if ($registry->has('likertScaleInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('likertScaleInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScale()
            )(
                ['0.5.0']
            )
        );
    }
}
