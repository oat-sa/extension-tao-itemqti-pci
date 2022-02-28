<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\qtiItemPci\model\PciModel;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202202031355181465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Update Audio recording PCI: Catch error when browser does not support media format';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        if ($registry->has('audioRecordingInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('audioRecordingInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciAudioRecording()
            )(
                ['0.14.2']
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
