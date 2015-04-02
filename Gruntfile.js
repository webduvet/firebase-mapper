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
				src:['lib/fm.js', 'lib/model*.js', 'lib/list*.js', 'lib/exception*.js', 'lib/provider*.js'],
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
		},
		watch:
		{
			files: ['lib/*.js'],
			tasks: ['jshint']
		},
		nodeunit:
		{
			files: ['test/*.js']
		}
	});

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'nodeunit']);
	grunt.registerTask('prod', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('watch', ['watch']);
	grunt.registerTask('test', ['nodeunit']);

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

};
