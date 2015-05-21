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
				src:['src/fm.js', 'src/static.js', 'src/basic.js', 'src/model*.js', 'src/list*.js','src/shortlist.js' , 'src/reference*.js', 'src/exception*.js', 'src/provider*.js'],
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
			src:['src/*.js']
		},
		watch:
		{
			files: ['src/*.js'],
			tasks: ['jshint', 'concat']
		},
		/*
		nodeunit:
		{
			files: ['test/*.js']
		},
		*/
		nodeunit:
		{
			files: ['test/basic.js']
		},
		yuidoc:
		{
			compile:{
				name: 'build/<%= pkg.name %>.js',
				//description: '<%= pkg.description %>',
				//version: '<%= pkg.version %>',
				//url: '<%= pkg.homepage %>',
				options: {
					paths: 'build/',
					//themedir: 'path/to/custom/theme/',
					outdir: 'docs/'
				}
			}
		}
	});

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'nodeunit', 'yuidoc']);
	grunt.registerTask('build', ['jshint', 'concat' ]);
	grunt.registerTask('dist', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('watch', ['watch']);
	grunt.registerTask('test', ['nodeunit']);

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');

};
