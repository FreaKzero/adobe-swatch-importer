module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            lesswatch: {
                files: ['src/**'],
                tasks: ['uglify:dev']
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> Copyright (C) 2015, Thomas Petrovic <pete@freakzero.com> \n Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license */ \n'
            },

            main: {

                options: {
                    sourceMap: true,
                    sourceMapName: 'dist/SwatchImporter.map'
                },

                files: {
                    'dist/SwatchImporter.min.js': ['src/SwatchImporter.js'],
                }
            },

            dev: {

                options: {
                    sourceMap: true,
                    sourceMapName: 'demo/lib/SwatchImporter.map'
                },

                files: {
                    'demo/lib/SwatchImporter.min.js': ['src/SwatchImporter.js']
                }
            }

        },

        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'demo/**/*.js',
                        'demo/*.html'
                    ]
                },
                options: {
                    server: './demo',
                    watchTask: true
                }
            }
        },
        yuidoc: {
            main: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                options: {
                    paths: 'src/',
                    outdir: 'doc/'
                }
            }
        }
    });

    // Plugins
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('dev', ['browserSync', 'watch']);
    grunt.registerTask('dist', ['uglify']);
};