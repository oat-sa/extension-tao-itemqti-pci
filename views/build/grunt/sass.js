module.exports = function (grunt) {
    'use strict';

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/qtiItemPci/views/';

    sass.qtiitempci = {
        options : {},
        files : {}
    };
    sass.qtiitempci.files[root + 'css/pci-manager.css'] = root + 'scss/pci-manager.scss';
    sass.qtiitempci.files[root + 'js/pciCreator/dev/audioRecordingInteraction/creator/css/audioRecordingInteraction.css'] = root + 'js/pciCreator/dev/audioRecordingInteraction/creator/scss/audioRecordingInteraction.scss';
    sass.qtiitempci.files[root + 'js/pciCreator/dev/audioRecordingInteraction/runtime/css/audioRecordingInteraction.css'] = root + 'js/pciCreator/dev/audioRecordingInteraction/runtime/scss/audioRecordingInteraction.scss';
    sass.qtiitempci.files[root + 'js/pciCreator/dev/mathEntryInteraction/runtime/css/mathEntryInteraction.css'] = root + 'js/pciCreator/dev/mathEntryInteraction/runtime/scss/mathEntryInteraction.scss';

    watch.qtiitempcisass = {
        files : [
            root + 'scss/**/*.scss',
            root + 'js/pciCreator/dev/**/*.scss'
        ],
        tasks : ['sass:qtiitempci', 'notify:qtiitempcisass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.qtiitempcisass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    grunt.registerTask('qtiitempcisass', ['sass:qtiitempci']);
};