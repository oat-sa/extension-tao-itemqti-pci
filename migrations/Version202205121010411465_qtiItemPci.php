<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\scripts\install\RegisterPciLikertScale2;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202205121010411465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'register likertScaleInteraction2';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterPciLikertScale2()
            )(
                ['0.6.0']
            )
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
