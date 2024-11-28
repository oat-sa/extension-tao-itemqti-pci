<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\reporting\ReportInterface;
use oat\qtiItemPci\model\portableElement\configuration\AudioRecordingInteractionCreatorConfigurationRegistry;
use oat\qtiItemPci\scripts\install\SetupAudioRecordingInteractionCreatorConfigurationRegistry;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202411201142151465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set the Audio PCI maximum allowed time limit to 1800 seconds';
    }

    public function up(Schema $schema): void
    {
        $report = $this->propagate(new SetupAudioRecordingInteractionCreatorConfigurationRegistry())([]);

        $this->abortIf(
            $report->getType() === ReportInterface::TYPE_ERROR,
            $report->getMessage()
        );

        $this->addReport(
            $report
        );
    }

    public function down(Schema $schema): void
    {
        /** @var AudioRecordingInteractionCreatorConfigurationRegistry $audioRecordingCreatorConfigurationRegistry */
        $audioRecordingCreatorConfigurationRegistry = $this->getServiceLocator()->getContainer()
            ->get(AudioRecordingInteractionCreatorConfigurationRegistry::class);

        $audioRecordingCreatorConfigurationRegistry->setMaximumRecordingTimeLimit(60 * 20);
    }
}
