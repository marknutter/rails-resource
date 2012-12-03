basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'angular.js',
  '../rails-resource-*.js',
  'angular-mocks.js',
  'rails-resource-spec.js'
];

// server port
port = 8081;

// runner port
runnerPort = 9100;

// auto-watch off by default
autoWatch = false;
singleRun = true;

browsers = ['PhantomJS'];

reporters = ['dots', 'junit'];

junitReporter = {
  outputFile: 'test/output/unit-results.xml'
};
