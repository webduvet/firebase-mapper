module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:
		{
			options:
			{
				separarator: ';'
			},
			dist:
			{
				src:['lib/zz.js', 'lib/model*.js', 'lib/list*.js', 'lib/exception*.js', 'lib/provider*.js'],
				dest:"dist/<%= pkg.name %>.js"
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
	grunt.registerTask('concat', ['concat']);

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');

};
