<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\qtiItemPci\scripts\install\RegisterIMSPciAudioRecording;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202306061059281465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Update Audio Recording PCI: add sequential/hideRecordButton/hideStopButton/playSound optons, fix allowPlayback option';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        $this->addReport(
            $this->propagate(
                new RegisterIMSPciAudioRecording()
            )(
                ['1.1.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterIMSPciAudioRecording::class
        );
    }
}
