<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\scripts\install\RegisterIMSPciAudioRecording;
use oat\qtiItemPci\scripts\install\RegisterPciAudioRecording;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale;
use oat\qtiItemPci\scripts\install\RegisterPciLiquid;
use oat\qtiItemPci\scripts\install\RegisterPciMathEntry;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202309191437281465_qtiItemPci extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update PCIs (AudioRecording, LikertScale, Liquids, MathEntry) to work with Handlebars 4';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterIMSPciAudioRecording()
            )(
                ['2.0.0']
            )
        );

        $this->addReport(
            $this->propagate(
                new RegisterPciAudioRecording()
            )(
                ['1.0.0']
            )
        );

        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScale()
            )(
                ['1.0.0']
            )
        );

        $this->addReport(
            $this->propagate(
                new RegisterPciLiquid()
            )(
                ['1.0.0']
            )
        );

        $this->addReport(
            $this->propagate(
                new RegisterPciMathEntry()
            )(
                ['3.0.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, restore the pre-Handlebars-4 versions of all the PCIs and run their registration scripts'
        );
    }
}
