// Karma configuration
// Generated on Mon May 18 2015 16:39:43 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({
    browserNoActivityTimeout: 30000,
    basePath: '',
    frameworks: ['source-map-support', 'browserify', 'mocha'],
    files: [
      'test/**.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'index.js': ['browserify'],
      'test/index.js': [ 'browserify']
    },
    browserify: {
      debug: true,
      transform: ['babelify']
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true
  });
};
