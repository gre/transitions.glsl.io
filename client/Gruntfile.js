
module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['build', 'watch']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify', 'stylus']);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true,
        convertJSX: true
      },
      src: ['src/**/*.js']
    },
    uglify: {
      prod: {
        src: '../server/public/bundle.js',
        dest: '../server/public/bundle.min.js'
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
        src: 'src/embed/index.styl',
        dest: '../server/public/embed.css'
      }
    },
    browserify: {
      app: {
        src: 'src/index.js',
        dest: '../server/public/bundle.js',
        options: {
          transform: ["envify", "reactify"],
          debug: true
        }
      },
      embed: {
        src: 'src/embed/index.js',
        dest: '../server/public/embed.js',
        options: {
          transform: ["reactify"],
          debug: true
        }
      }
    },
    watch: {
      options: {
        livereload: 35735,
        debounceDelay: 400
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'browserify'],
      },
      css: {
        files: ['src/**/*.styl'],
        tasks: ['stylus']
      }
    }
  });
};
