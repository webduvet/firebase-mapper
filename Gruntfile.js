module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:
		{
		},
		jshint:
		{
			options:{
				laxcomma: true
			},
			src:['lib/zz.js', 'lib/model.js']
		}
	});

	// Default task(s).
	grunt.registerTask('default', ['jshint']);

	grunt.loadNpmTasks('grunt-contrib-jshint');

};
