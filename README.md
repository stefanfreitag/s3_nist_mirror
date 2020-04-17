# S3 NIST Mirror

### General information

### Cron Job

## AoB

### Generate the required Lambda layer

The Python code requires additional modules that will be provided as part of
a Lambda layer. For the creation of the layer execute the following commands.

```bash
mkdir -p nist-cdk-dependencies/python
pip3 install boto3 requests datetime boto -t nist-cdk-dependencies/python
cd nist-cdk-dependencies/
zip -r nist-cdk-depencencies.zip python
```

Upload the zip archive as new Lambda layer to AWS.

## ToDos

* Remove downloading to /tmp directory

## Links

* [CVE Scoring System](https://www.first.org/cvss/specification-document)
* [CVE Scoring System (Wikipedia)](https://en.wikipedia.org/wiki/Common_Vulnerability_Scoring_System)
* [CVE (Wikipedia)](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures)
* [National Vulnerability Database](https://nvd.nist.gov/)
  