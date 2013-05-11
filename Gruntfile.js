'use strict';

var port = 8000;
var lrport = port + 1;

module.exports = function (grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: port,
          base: '.www'
        }
      }
    },

    watch: {
      options: {
        livereload: lrport
      },
      html: {
        files: [
          'pages/{,**/}*.html',
          'pages/{,**/}*.md',
          'templates/{,**/}*.html'
        ],
        tasks: ['generator:dev']
      },
      js: {
        files: [
          'js/{,**/}*.js',
          '!js/{,**/}*.min.js'
        ],
        tasks: ['jshint', 'uglify:dev']
      },
      images: {
        files: ['images/**'],
        tasks: ['copy:dev']
      },
      fonts: {
        files: ['fonts/**'],
        tasks: ['copy:dev']
      },
      css: {
        files: ['sass/{,**/}*.scss'],
        tasks: ['compass:dev']
      }
    },

    generator: {
      dev: {
        files: [{
          cwd: 'pages',
          src: ['**/*'],
          dest: '.www',
          ext: '.html'
        }],
        options: {
          partialsGlob: 'pages/partials/*.html',
          templates: 'templates',
          handlebarsHelpers: 'helpers',
          environment: 'dev',
          development: true,
          lrport: lrport
        }
      },
      dist: {
        files: [{
          cwd: 'pages',
          src: ['**/*'],
          dest: '.dist',
          ext: '.html'
        }],
        options: {
          partialsGlob: 'pages/partials/*.html',
          templates: 'templates',
          handlebarsHelpers: 'helpers',
          environment: 'prod',
          development: false
        }
      }
    },

    compass: {
      options: {
        sassDir: 'sass',
        config: 'config.rb',
        bundleExec: true
      },
      dev: {
        options: {
          imagesDir: '.www/images',
          cssDir: '.www/css',
          javascriptsDir: '.www/js',
          fontsDir: '.www/fonts',
          environment: 'development'
        }
      },
      dist: {
        options: {
          imagesDir: '.dist/images',
          cssDir: '.dist/css',
          javascriptsDir: '.dist/js',
          fontsDir: '.dist/fonts',
          environment: 'production',
          force: true
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'js/{,**/}*.js',
        '!js/{,**/}*.min.js'
      ]
    },

    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          cwd: 'images',
          src: ['**/*.png', '**/*.jpg'],
          dest: '.dist/images/'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'images',
          src: '**/*.svg',
          dest: '.dist/images'
        }]
      }
    },

    uglify: {
      dev: {
        options: {
          mangle: false,
          compress: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: 'js',
          src: ['**/*.js', '!**/*.min.js'],
          dest: '.www/js',
          ext: '.min.js'
        }]
      },
      dist: {
        options: {
          mangle: true,
          compress: true
        },
        files: [{
          expand: true,
          cwd: 'js',
          src: ['**/*.js', '!**/*.min.js'],
          dest: '.dist/js',
          ext: '.min.js'
        }]
      }
    },

    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: 'fonts',
            src: ['**'],
            dest: '.www/fonts'
          },
          {
            expand: true,
            cwd: 'images',
            src: ['**'],
            dest: '.www/images'
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'fonts',
            src: ['**'],
            dest: '.dist/fonts'
          },
          {
            expand: true,
            cwd: 'images',
            src: [
              '**',
              '!**/*.png',
              '!**/*.jpg',
              '!**/*.svg'
            ],
            dest: '.dist/images'
          }
        ]
      }
    },

    parallel: {
      assets: {
        grunt: true,
        tasks: ['imagemin', 'svgmin', 'uglify:dist', 'copy:dist', 'generator:dist']
      }
    },

    exec: {
      git_status: {
        cmd: 'git status'
      },
      launch: {
        cmd: 'open http://localhost:' + port + '&& echo "Launched localhost:"' + port
      }
    }

  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config([
      'copy:dev',
      'compass:dev',
      'generator:dev',
      'jshint'
    ], filepath);
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-parallel');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-generator');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('build', [
    'parallel:assets',
    'compass:dist',
    'jshint',
    'exec:git_status'
  ]);

  grunt.registerTask('server-init', [
    'copy:dev',
    'compass:dev',
    'generator:dev',
    'jshint'
  ]);

  // Launch option to start server and launch site
  var launch = grunt.option('launch');
  if (launch) {
    grunt.registerTask('server', [
      'server-init',
      'connect',
      'exec:launch',
      'watch'
    ]);
  }
  else {
    grunt.registerTask('server', [
      'server-init',
      'connect',
      'watch'
    ]);
  }


};