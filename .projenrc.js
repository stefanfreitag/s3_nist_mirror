const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Stefan Freitag',
  authorAddress: 'stefan.freitag@udo.edu',
  cdkVersion: '2.96.2',
  stability: Stability.EXPERIMENTAL,
  defaultReleaseBranch: 'master',
  name: 's3_nist_mirror',
  repositoryUrl: 'git://github.com/stefanfreitag/s3_nist_mirror.git',
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
  typescriptVersion: '4.3.5',
});
project.gitignore.addPatterns('.history/');
project.npmignore.addPatterns('.history/');

project.synth();