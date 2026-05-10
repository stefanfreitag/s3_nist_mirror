const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Stefan Freitag',
  authorAddress: 'stefan.freitag@udo.edu',
  cdkVersion: '2.253.1',
  constructsVersion: '10.6.0',
  stability: Stability.EXPERIMENTAL,
  defaultReleaseBranch: 'master',
  name: 's3_nist_mirror',
  projenVersion: '0.99.58',
  repositoryUrl: 'git://github.com/stefanfreitag/s3_nist_mirror.git',
  minNodeVersion: '24.0.0',
  workflowNodeVersion: '24.x',
  packageManager: 'npm',
  npmTrustedPublishing: true,
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
  keywords: [
    'aws',
    'cdk',
    's3',
  ],
});
project.gitignore.addPatterns('.history/');
project.npmignore.addPatterns('.history/');

project.synth();
