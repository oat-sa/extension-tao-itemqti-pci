<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use common_report_Report as Report;
use Doctrine\DBAL\Schema\Schema;
use oat\qtiItemPci\model\portableElement\configuration\AudioRecordingInteractionCreatorConfigurationRegistry;
use oat\qtiItemPci\scripts\install\SetupAudioRecordingInteractionCreatorConfigurationRegistry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202008101209171465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set up audioRecordingInteraction client-side options.';
    }

    public function up(Schema $schema): void
    {
        /** @var SetupAudioRecordingInteractionCreatorConfigurationRegistry $script */
        $script = $this->propagate(new SetupAudioRecordingInteractionCreatorConfigurationRegistry());
        $report = $script([]);

        $this->abortIf(
            $report->getType() === Report::TYPE_ERROR,
            $report->getMessage()
        );

        $this->addReport(
            $report
        );
    }

    public function down(Schema $schema): void
    {
        AudioRecordingInteractionCreatorConfigurationRegistry::getRegistry()->remove(
            AudioRecordingInteractionCreatorConfigurationRegistry::ID
        );
    }
}
