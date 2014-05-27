module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      src: ['src/**.js']
    },
    uglify: {
      prod: {
        src: 'tmp/bundle-before-min.js',
        dest: '../server/public/bundle.js'
      },
      embed: {
        src: '../server/public/embed.js',
        dest: '../server/public/embed.min.js'
      }
    },
    stylus: {
      app: {
        src: 'src/index.styl',
        dest: '../server/public/bundle.css'
      },
      embed: {
        src: 'src/embed.styl',
        dest: '../server/public/embed.css'
      }
    },
    browserify: {
      app: {
        src: 'src/index.js',
        dest: '../server/public/bundle.js',
        options: {
          transform: ["hbsfy"],
          debug: true
        }
      },
      prod: {
        src: 'src/index.js',
        dest: 'tmp/bundle-before-min.js',
        options: {
          transform: ["hbsfy"]
        }
      },
      embed: {
        src: 'src/embed.js',
        dest: '../server/public/embed.js'
      }
    },
    watch: {
      options: {
        livereload: 35735,
        debounceDelay: 1000
      },
      js: {
        files: ['src/**/*.js', 'src/**/*.hbs'],
        tasks: ['jshint', 'browserify:app', 'browserify:embed', 'uglify:embed'],
      },
      css: {
        files: ['src/**/*.styl'],
        tasks: ['stylus']
      }
    }
  });


  grunt.registerTask('default', ['build', 'watch']);
  grunt.registerTask('build', ['jshint', 'browserify:app', 'browserify:embed', 'uglify:embed', 'stylus:app', 'stylus:embed']);
  grunt.registerTask('build-prod', ['jshint', 'browserify:prod', 'browserify:embed', 'uglify', 'stylus:app', 'stylus:embed']);
};
