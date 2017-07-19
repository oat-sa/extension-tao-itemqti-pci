module.exports = function(grunt) {
    'use strict';

    var root        = grunt.option('root');
    var libs        = grunt.option('mainlibs');
    var ext         = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    var out         = 'output';

    var paths = {
        'likertScaleInteraction':      root + '/qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction',
        'liquidsInteraction':      root + '/qtiItemPci/views/js/pciCreator/dev/liquidsInteraction',
        'taoQtiItem':                  root + '/taoQtiItem/views/js',
        'taoQtiItemCss':               root + '/taoQtiItem/views/css',
        'qtiCustomInteractionContext': root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext'
    };

    var itemRuntime = ext.getExtensionSources('taoQtiItem', ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js',  'views/js/qtiCommonRenderer/helpers/**/*.js'], true);
    var testRuntime = ext.getExtensionSources('taoQtiTest', ['views/js/runner/**/*.js'], true);
    var testPlugins = ext.getExtensionSources('taoQtiTest', ['views/js/runner/plugins/**/*.js'], true);

    grunt.config.merge({

        /**
        * Compile tao files into a bundle
        */
        requirejs : {
            //taoqtitestbundle : {
            //    options: {
            //        paths : paths,
            //        dir : out,
            //        modules : [{
            //            name: 'taoQtiTest/controller/routes',
            //            include : ext.getExtensionsControllers(['taoQtiTest']),
            //            exclude : ['mathJax','taoQtiTest/controller/runner/runner'].concat(libs)
            //        }]
            //    }
            //},
            //qtitestrunner : {
            //    options: {
            //        paths : paths,
            //        include: ['lib/require', 'loader/bootstrap'].concat(testRuntime).concat(itemRuntime),
            //        excludeShallow : ['mathJax', 'ckeditor'].concat(testPlugins),
            //        exclude : ['json!i18ntr/messages.json'],
            //        name: "taoQtiTest/controller/runner/runner",
            //        out: out + "/qtiTestRunner.min.js"
            //    }
            //},
            //taoqtitestplugins : {
            //    options: {
            //        paths : paths,
            //        include: testPlugins,
            //        excludeShallow : ['mathJax'],
            //        exclude : ['json!i18ntr/messages.json'].concat(libs),
            //        out: out + "/testPlugins.min.js"
            //    }
            //},
            pciLiquid : {
                options: {
                    paths : paths,
                    include: ['liquidsInteraction/runtime/liquidsInteraction'],
                    excludeShallow : ['mathJax'],
                    exclude : ['qtiCustomInteractionContext'],
                    wrap : {
                        start : '',
                        end : "define(['liquidsInteraction/runtime/liquidsInteraction'],function(pci){return pci;});"
                    },
                    out: out + "/pciLiquids.min.js"
                }
            },
            pciLikert : {
                options: {
                    paths : paths,
                    include: ['likertScaleInteraction/runtime/likertScaleInteraction'],
                    excludeShallow : ['mathJax'],
                    exclude : ['qtiCustomInteractionContext'],
                    wrap : {
                        start : '',
                        end : "define(['likertScaleInteraction/runtime/likertScaleInteraction'],function(pci){return pci;});"
                    },
                    out: out + "/pciLikert.min.js"
                }
            }
        },

        copy : {
            qtiitempcibundle : {
                files: [
                    { src: [out + '/pciLikert.min.js'],  dest: root + '/qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction/runtime/likert.js'},
                    { src: [out + '/pciLiquids.min.js'],  dest: root + '/qtiItemPci/views/js/pciCreator/dev/liquidsInteraction/runtime/liquid.js'},
                ]
            }
        }
    });

    // bundle task
    grunt.registerTask('qtiitempcibundle', [
        'clean:bundle',
        'requirejs:pciLikert',
        'requirejs:pciLiquid',
        'copy:qtiitempcibundle'
    ]);
};
