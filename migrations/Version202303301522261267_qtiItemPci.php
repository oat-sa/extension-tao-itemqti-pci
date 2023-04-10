<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\PciModel;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202303301522261267_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Update minimum recording time to 5 seconds';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        $this->addReport(
            $this->propagate(new RegisterPciAudioRecording()
            )(
                ['0.14.5']
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
