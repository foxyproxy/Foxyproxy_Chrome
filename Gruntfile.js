/*jshint camelcase: false*/
// Generated on 2013-11-13 using generator-chrome-extension 0.2.5
'use strict';
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        // watch: {
        //     options: {
        //         spawn: false
        //     },
        //     compass: {
        //         files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        //         tasks: ['compass:server']
        //     }
        // },
        browserify: {
            options: {
                src: '<%= yeoman.app %>/scripts/stored-credentials.js',
                dest: '<%= yeoman.dist %>/scripts/stored-credentials-bundle.js'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*',
                        '.packageCrx'
                    ]
                }]
            },
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        jasmine: {
            all: {
                options: {
                    specs: 'test/spec/{,*/}*.js'
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>',
                assetsDirs: [ 'styles/images', 'styles/custom-theme/images']
                
            },
            html: [
                '<%= yeoman.app %>/background.html',
                '<%= yeoman.app %>/popup.html',
                '<%= yeoman.app %>/options.html'
            ]
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>'],
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                },
                {
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/styles/images'
                    
                },
                {
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles/custom-theme/images',
                    src: '{,*/}*.png',
                    dest: '<%= yeoman.dist %>/styles/custom-theme/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif}',
                        '_locales/{,*/}*.json',
                        'scripts/*.js',
                        'scripts/options/*.js',
                        'vendor/scripts/*.js'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }],
                options: {
                    noProcess: "stored-credentials.js"
                }
            },
            packageCrx: {
                expand: true,
                cwd: '<%= yeoman.dist %>',
                src: '**',
                dest: 'packageCrx/<%= foxyProxy.pkgName %>',
            }
            // manifest: {
            //     files: [{ 
            //         expand: true,
            //         cwd: '<%= yeoman.app %>',
            //         dest: '<%= yeoman.dist %>/',
            //         src: ['manifest.json']
            //         
            //     }]
            // }
        },
        concurrent: {
            //server: [
            //    'compass:server'
            //],
            // test: [
            //     'compass'
            // ],
            dist: [
                //'compass:dist',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        // chromeManifest: {
        //     dist: {
        //         options: {
        //             buildnumber: true,
        //             background: {
        //                 target:'scripts/background.js'
        //             }
        //         },
        //         src: '<%= yeoman.app %>',
        //         dest: '<%= yeoman.dist %>'
        //     }
        // },
        compress: {
            dist: {
                options: {
                    mode: 'zip',
                    archive: function() {
                        var messages = grunt.file.readJSON(yeomanConfig.dist + '/_locales/en/messages.json');
                        
                        var pkgName = 'foxyproxy-' +
                                messages.FoxyProxy_Target.message + '-' +
                                messages.FoxyProxy_Edition.message + '-' +
                                messages.FoxyProxy_Version.message + '.zip';
                                
                        grunt.log.writeln("Packaging archive as " +pkgName);
                        
                        return 'package/' + pkgName;
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.registerTask('test', [
        'clean',
        //'concurrent:test',
        'jasmine'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        //'chromeManifest:dist',
        'useminPrepare',
        'concurrent:dist',
        'cssmin',
        'concat',
        'uglify',
        'copy:dist',
        'messages',
        'manifest',
        //'copy:manifest',
        'browserify',
        'usemin',
        'compress'
    ]);
    
    grunt.registerTask('manifest', ['messages'], function() {
        var manifest = grunt.file.readJSON(yeomanConfig.app + '/manifest.json'),
            messages = grunt.file.readJSON(yeomanConfig.dist + '/_locales/en/messages.json');
        
        grunt.log.writeln("Writing manifest file...");
        
        manifest.name = messages.appName.message;
        
        manifest.version = messages.FoxyProxy_Version.message;
                
        grunt.file.write( yeomanConfig.dist + '/manifest.json', JSON.stringify(manifest));
    });
    
    grunt.registerTask('messages', [], function() {
        var currentVersion,
            versions,
            messages,
            ga_key = grunt.option('ga-key'),
            target = grunt.option('target') || 'Chrome', // default to Chrome extension if not supplied.
            edition = grunt.option('edition') || 'Standard'; // default to Standard edition if not supplied.
            
        grunt.log.writeln("Edition: " + edition);
        
        // reset options in case we used defaults
        grunt.option('target', target);
        grunt.option('edition', edition);
        
        grunt.log.writeln("Generating messages for target: " + target + " and edition: " + edition);
        
        messages = grunt.file.readJSON(yeomanConfig.app + '/_locales/en/messages.json');
        
        versions = grunt.file.readJSON('versions.json');
        currentVersion = versions[target][edition];
        
        messages.FoxyProxy_Version = {
            message: currentVersion.release + "." + currentVersion.major + "." + currentVersion.minor + ( currentVersion.build ? "."+ currentVersion.build :""),
            description: "Generated by Grunt."
        };
        
        messages.FoxyProxy_Target = {
            message: target,
            description: "Name of the target browser for the extension. Generated by Grunt."
        };
        
        messages.FoxyProxy_Edition = {
            message: edition,
            description: "Edition of the extension. Generated by Grunt."
        };
        
        messages.appName = {
            // message: messages.FoxyProxy.message
            message:  messages.FoxyProxy.message + " " + edition,
            description: "The name of the application. - Generated by Grunt."
        };
        
        // TODO: generate for all languages
        messages.appDescription = {
            message: messages.FoxyProxy.message + " " + edition + " " + messages["for"].message + " " + target,
            description: "The description of the application. - Generated by Grunt."
        };
        
        // pass ga_key on command line so we don't hard-code it into foxyproxy source.
        if (ga_key) {
            grunt.log.writeln("Using ga-key: " +ga_key);
            messages.ga_key = {
                message: ga_key,
                description: "Google Analytics key for usage tracking."
            };
        } else {
             grunt.log.writeln("--ga-key was not passed on command-line. Google Analytics tracking will not work!");
        }
        
        
        grunt.file.write( yeomanConfig.dist + '/_locales/en/messages.json', JSON.stringify(messages));
        
    });
    
    grunt.registerTask('package', ['build'], function() {
        
        var messages = grunt.file.readJSON(yeomanConfig.dist + '/_locales/en/messages.json');
        
        var pkgName = 'foxyproxy-' +
                messages.FoxyProxy_Target.message + '-' +
                messages.FoxyProxy_Edition.message + '-' +
                messages.FoxyProxy_Version.message;
                
        grunt.log.writeln('setting pkgName to: ' + pkgName);
        grunt.config.set('foxyProxy.pkgName', pkgName);
        
        grunt.file.mkdir('packageCrx');

        grunt.task.run('copy:packageCrx', 'signPackage');
        
    });
    
    grunt.registerTask('signPackage', ['package'], function() {
        // FIXME: defaults to Mac path because mcollins develops on a Mac :-/
        var chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        
        var edition = grunt.option('edition') || 'Standard';
         
        var keyfile;
        if (grunt.option('keyfile')) {
            keyfile = grunt.file.expand(grunt.option('keyfile')); 
        } else {
            keyfile = grunt.file.expand({
                    cwd: '/'
                },
                yeomanConfig.dist + '/../../' + edition + '.pem'
            );
        }
        
        
        grunt.log.writeln("keyfile is: " + keyfile);
        grunt.log.writeln('ChromePath is: ' + chromePath);

        var pkgName = grunt.config('foxyProxy.pkgName');
        
        grunt.log.writeln("Packaging Chrome Extension (.crx) file from " + pkgName);
        
        var done = this.async();
        
        grunt.util.spawn({
            cmd: chromePath,
            args: [ 
                "--pack-extension=" + pkgName,
                "--pack-extension-key=" + keyfile
            ],
            opts: {
                cwd: './packageCrx',
                stdio: 'inherit'
            }
        },
        function(error, result, code) {
            grunt.log.writeln('Finished packaging extension');
            grunt.log.writeln(result);
            
            if (error) {
                grunt.log.writeln("Failed to sign package file.");
                grunt.log.writeln("Exit " + code + ":");
                
                return false;
            }
            
            grunt.log.writeln('Copying output files...');
            grunt.file.copy('./packageCrx/' + pkgName + ".crx", 'package/' + pkgName + ".crx");
            grunt.file.copy('./packageCrx/' + pkgName + ".pem", 'package/' + pkgName + ".pem");
            
            grunt.file.delete('./packageCrx');
            
            grunt.log.writeln('done.');
            done();
        });
        
    });
    

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
    
    grunt.registerTask('release', [
        'clean',
        'build',
        'package'
    ]);
    
    grunt.loadNpmTasks('grunt-contrib-copy');
};
