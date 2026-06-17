<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202606121559381465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update TAO Audio Recording PCI: preserve loaded recording during Safari autoplay setup';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciAudioRecording()
            )(
                ['0.15.3']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run '
            . RegisterPciAudioRecording::class
        );
    }
}
