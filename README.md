# S3 NIST Mirror

## General information

The [National Institute of Standards and Technology](https://www.nist.gov/) (NIST) maintains the [National Vulnerability Database](https://nvd.nist.gov/) (NVD).

> The NVD is the U.S. government repository of standards based vulnerability management data represented using the Security Content Automation Protocol (SCAP). This data enables automation of vulnerability management, security measurement, and compliance. The NVD includes databases of security checklist references, security-related software flaws, misconfigurations, product names, and impact metrics

This [CDK](https://github.com/aws/aws-cdk) stack mirrors the data available from
the JSON feed to an [S3](https://aws.amazon.com/s3/) bucket.
Additionally it sets up a cron job to refresh the mirror on a monthly base.

### The cron job

The actual mirror operation is modelled as Lambda function. A CloudWatch Event Rule
is responsible for the execution of the Lambda on the first day of each month.

```javascript
const target = new LambdaFunction(fn);
new Rule(this, "ScheduleRule", {
    schedule: Schedule.cron({ minute: "0", hour: "0", day: "1", month: "*" }),
    targets: [target],
});
```

## The lambda function

The lambda function downloads the metainformation as well as the gzipped JSON data.

## The required Lambda layer

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
* Create Lambda layer automatically

## Links

* [National Vulnerability Database](https://nvd.nist.gov/)
* [CVE Scoring System](https://www.first.org/cvss/specification-document)
* [CVE Scoring System (Wikipedia)](https://en.wikipedia.org/wiki/Common_Vulnerability_Scoring_System)
* [CVE (Wikipedia)](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures)
