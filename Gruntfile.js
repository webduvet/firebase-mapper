module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:
		{
			options:
			{
				separarator: ';'
			},
			build:
			{
				src:['lib/zz.js', 'lib/model*.js', 'lib/list*.js', 'lib/exception*.js', 'lib/provider*.js'],
				dest:"build/<%= pkg.name %>.js"
			}
		},
		uglify:
		{
			options:
			{
			},
			dist:
			{
				files:
				{
					'dist/<%= pkg.name %>.min.js': ['<%= concat.build.dest %>']
				}
			}
		},
		jshint:
		{
			options:{
				laxcomma: true
			},
			src:['lib/*.js']
		}
	});

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat']);
	grunt.registerTask('prod', ['jshint', 'concat', 'uglify']);

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

};