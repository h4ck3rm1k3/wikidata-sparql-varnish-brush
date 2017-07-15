/* jshint node:true */
module.exports = function( grunt ) {
	'use strict';
	require( 'load-grunt-tasks' )( grunt );
	var pkg = grunt.file.readJSON( 'package.json' );
	var buildFolder = 'build';

	grunt.initConfig( {

		pkg: pkg,
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
					'**/*.js', '!dist/**', '!' + buildFolder + '/**'
			]
		},
		jscs: {
			src: '<%= jshint.all %>'
		},
		jsonlint: {
			all: [
					'**/*.json', '!node_modules/**', '!vendor/**', '!dist/**', '!' + buildFolder + '/**', '!polestar/**'
			]
		},
		qunit: {
			all: [
				'wikibase/tests/*.html'
			]
		},
		stylelint: {
			all: [
				'style.css'
			]
		},
		banana: {
			all: 'i18n/',
					options: {
						disallowBlankTranslations: false
					}
				},
		clean: {
			release: [
				buildFolder
			],
			deploy: [
					buildFolder + '/*', buildFolder + '!.git/**'
			]
		},
		concat: {},
		uglify: {},
		filerev: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 20
			},
			release: {
				files: [
					{
						src: [
								buildFolder + '/js/*.js', buildFolder + '/css/*.css'
						]
					}
				]
			}
		},
		'auto_install': {
			local: {}
		}
	} );

	grunt.registerTask( 'test', [
		'jshint', 'jscs', 'jsonlint', 'banana', 'stylelint', 'qunit'
	] );
	grunt.registerTask( 'build', [
		'clean', 'create_build'
	] );
	grunt.registerTask( 'create_build', [
		'auto_install', 'test', 'copy', 'useminPrepare', 'concat', 'cssmin', 'uglify', 'filerev', 'usemin', 'htmlmin', 'merge-i18n'
	] );
	grunt.registerTask( 'deploy', [
		'clean', 'shell:updateRepo', 'shell:cloneDeploy', 'clean:deploy', 'create_build', 'shell:commitDeploy', 'configDeploy', 'shell:review'
	] );
	grunt.registerTask( 'default', 'test' );

};
