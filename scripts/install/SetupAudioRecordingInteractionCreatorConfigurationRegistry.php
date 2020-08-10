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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */

declare(strict_types=1);

namespace oat\qtiItemPci\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\script\ScriptAction;
use oat\qtiItemPci\model\portableElement\configuration\AudioRecordingInteractionCreatorConfigurationRegistry;
use ReflectionMethod;

class SetupAudioRecordingInteractionCreatorConfigurationRegistry extends ScriptAction
{
    public const MAXIMUM_RECORDING_TIME_LIMIT = 'maximumRecordingTimeLimit';

    private const OPTION_DEFAULT_VALUES = [
        self::MAXIMUM_RECORDING_TIME_LIMIT => 60 * 20,
    ];

    protected function provideOptions(): array
    {
        return [
            self::MAXIMUM_RECORDING_TIME_LIMIT => [
                'prefix'      => 'mr',
                'longPrefix'  => self::MAXIMUM_RECORDING_TIME_LIMIT,
                'description' => sprintf(
                    'Maximum allowed audio recording time in seconds, %u by default',
                    self::OPTION_DEFAULT_VALUES[self::MAXIMUM_RECORDING_TIME_LIMIT]
                ),
            ],
        ];
    }

    protected function provideDescription(): string
    {
        return sprintf('Sets `%s` values.', AudioRecordingInteractionCreatorConfigurationRegistry::class);
    }

    protected function run(): Report
    {
        $registry = $this->propagate(new AudioRecordingInteractionCreatorConfigurationRegistry());

        $setValues = [];

        foreach (self::OPTION_DEFAULT_VALUES as $optionName => $defaultValue) {
            $value = $this->getOption($optionName) ?? $defaultValue;

            if (null === $value) {
                continue;
            }

            $method = [$registry, 'set' . ucfirst($optionName)];

            if (!is_callable($method)) {
                continue;
            }

            settype($value, $this->getArgumentType($method));

            $method($value);

            $setValues[$optionName] = $value;
        }

        return $this->createReport($setValues);
    }

    private function createReport(array $setValues): Report
    {
        return $setValues
            ? Report::createSuccess(
                sprintf(
                    "Applied the following configuration to `%s`\n%s",
                    AudioRecordingInteractionCreatorConfigurationRegistry::class,
                    json_encode($setValues)
                )
            )
            : Report::createFailure(
                sprintf('No values set to `%s`', AudioRecordingInteractionCreatorConfigurationRegistry::class)
            );
    }

    private function getArgumentType(array $method): string
    {
        /** @noinspection PhpUnhandledExceptionInspection */
        $reflection = new ReflectionMethod(...$method);

        $arguments = $reflection->getParameters();

        $firstArgument = reset($arguments);

        if (!$firstArgument) {
            return 'null';
        }

        return (string)$firstArgument->getType();
    }
}
