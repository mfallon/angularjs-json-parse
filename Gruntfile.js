'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      css: {
        files: ['**/*.scss'],
        tasks: ['sass']
      }
    },
    sass: {
      dist: {
        files: {
          'app/app.css' : 'scripts/sass/app.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('dev', ['sass']);
 
};

