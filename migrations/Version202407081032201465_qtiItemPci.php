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
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202407081032201465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update Audio Recording PCI: fix console errors';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        $this->addReport(
            $this->propagate(
                new RegisterIMSPciAudioRecording()
            )(
                ['1.2.2']
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
