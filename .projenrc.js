const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Stefan Freitag',
  authorAddress: 'stefan.freitag@udo.edu',
  cdkVersion: '2.257.0',
  constructsVersion: '10.6.0',
  stability: Stability.EXPERIMENTAL,
  defaultReleaseBranch: 'master',
  name: 's3_nist_mirror',
  projenVersion: '0.99.66',
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

project.addDevDeps(
  '@stylistic/eslint-plugin@^5.10.0',
  '@types/jest@^30.0.0',
  '@types/node@^25.9.1',
  'eslint@^9.39.4',
  'eslint-import-resolver-typescript@^4.4.4',
  'jest@^30.4.2',
  'ts-jest@^29.4.11',
  'typescript@^6.0.3',
);

project.synth();
