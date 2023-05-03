<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\tao\scripts\tools\migrations\AbstractMigration;

final class Version202103240929581465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Added support for review mode for Audio Recording interaction';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();

        if ($registry->has('audioRecordingInteraction')) {
            /* @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('audioRecordingInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciAudioRecording()
            )(
                ['0.13.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciAudioRecording::class
        );
    }
}
