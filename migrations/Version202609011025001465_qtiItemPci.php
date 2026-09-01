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
final class Version202609011025001465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update TAO Audio Recording PCI: keep record disabled during auto-start delay';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciAudioRecording()
            )(
                ['0.15.4']
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
