module.exports = function(grunt) {

  grunt.initConfig({

    pkg: '<json:package.json>',

    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        '* Licensed under the MIT License. */'
    },

    concat: {
      js: {
        src:
         [
           '<banner:meta.banner>',
           '<file_strip_banner:src/path.js>'
         ],
        dest: '<%= pkg.name %>.js'
      }
    },

    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.js.dest>'],
        dest: '<%= pkg.name %>.min.js'
      }
    },

    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'concat min');

};
