<?php

declare(strict_types=1);

namespace oat\qtiItemPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\scripts\install\RegisterPciLikertNavigationLock;
use oat\qtiItemPci\model\PciModel;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202205121010411465_qtiItemPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'register likerNavigateLock';
    }

    public function up(Schema $schema): void
    {
        $registry = (new PciModel())->getRegistry();
        $this->addReport(
            $this->propagate(
                new RegisterPciLikertNavigationLock()
            )(
                ['0.14.4']
            )
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
