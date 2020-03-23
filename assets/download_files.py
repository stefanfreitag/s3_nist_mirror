from os import path
from typing import Dict

import datetime
import requests
import boto3
from boto.s3.bucket import Bucket
from botocore.exceptions import ClientError

S3_BUCKET = "nistmirrorstack-bucket43879c71-wd4w54yj15ch"

START_YEAR = 2018
END_YEAR = datetime.datetime.now().year

CVE_JSON_10_MODIFIED_URL = "https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-modified.json.gz"
CVE_JSON_10_BASE_URL = "https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-%d.json.gz"
CVE_MODIFIED_10_META = "https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-modified.meta"
CVE_BASE_10_META = "https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-%d.meta"

CVE_JSON_11_MODIFIED_URL = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.json.gz"
CVE_JSON_11_BASE_URL = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-%d.json.gz"
CVE_MODIFIED_11_META = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.meta"
CVE_BASE_11_META = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-%d.meta"

version10Filenames: Dict[str, str] = {
    "cveJsonModifiedUrl": CVE_JSON_10_MODIFIED_URL,
    "cveJsonBaseUrl": CVE_JSON_10_BASE_URL,
    "cveModifiedMeta": CVE_MODIFIED_10_META,
    "cveBaseMeta": CVE_BASE_10_META
}

version11Filenames: Dict[str, str] = {
    "cveJsonModifiedUrl": CVE_JSON_11_MODIFIED_URL,
    "cveJsonBaseUrl": CVE_JSON_11_BASE_URL,
    "cveModifiedMeta": CVE_MODIFIED_11_META,
    "cveBaseMeta": CVE_BASE_11_META

}

versionToFilenameMaps: Dict[str, Dict[str, str]] = {
    "1.0": version10Filenames,
    "1.1": version11Filenames
}


def do_download(cve_json_base_url: str):
    """
    Downloading the CVE file
    """
    filename = cve_json_base_url.split("/")[-1]
    if path.exists(filename):
        print("Skipping download of " + cve_json_base_url)
        return

    print("Downloading " + cve_json_base_url)
    result = requests.get(cve_json_base_url)
    open(filename, 'wb').write(result.content)


def download_version_for_year(version: str, year: int):
    """

    """
    print("Downloading version " + version + " for " + str(year))
    cve_base_meta_url = versionToFilenameMaps.get(
        version).get("cveBaseMeta").replace("%d", str(year))
    read_local_meta_for_url(cve_base_meta_url)
    # If meta information changed, then download the full file
    before = read_local_meta_for_url(cve_base_meta_url)
    do_download(cve_base_meta_url)
    after = read_local_meta_for_url(cve_base_meta_url)
    if (before is None) or (after.last_modified_date > before.last_modified_date):
        
        upload_file(cve_base_meta_url.split("/")[-1], None)    
        cve_json_base_url = versionToFilenameMaps.get(
            version).get("cveJsonBaseUrl").replace("%d", str(year))
        do_download(cve_json_base_url)
        upload_file(cve_json_base_url.split("/")[-1], None)    
        


def download(version: str) -> None:
    """

    """
    print("Downloading files for version " + version +
          " at " + str(datetime.datetime.now()))
    before = read_local_meta_for_url(
        versionToFilenameMaps.get(version).get("cveModifiedMeta"))
    do_download(versionToFilenameMaps.get(version).get("cveModifiedMeta"))
    after = read_local_meta_for_url(
        versionToFilenameMaps.get(version).get("cveModifiedMeta"))
    if (before is None) or (after.last_modified_date > before.last_modified_date):
        do_download(versionToFilenameMaps.get(
            version).get("cveJsonModifiedUrl"))

    for year in range(START_YEAR, END_YEAR):
        download_version_for_year(version, year)


def read_local_meta_for_url(meta_url: str):
    """
    Read meta information from local file
    """
    filename = meta_url.split("/")[-1]
    if path.exists(filename):
        f = open(filename, "r")
        lines = f.readlines()
        f.close()
        d = {}
        for line in lines:
            if len(line) == 0:
                continue
            keyValue = line.split(':', 1)
            d.update({keyValue[0]: keyValue[1]})
        return MetaInfo(d)
    return None


def upload_file(file_name, object_name=None):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    session = boto3.Session(profile_name='cdk')
    s3_client = session.client('s3')

    try:
        response = s3_client.upload_file(file_name, S3_BUCKET, object_name)
    except ClientError as e:
        print(e)
        return False
    return True


"""
 Meta properties object to hold information about the NVD CVE data
 
"""


class MetaInfo:

    def __init__(self, d: dict):
        self.last_modified_date = d["lastModifiedDate"]
        self.size = d["size"]
        self.zip_size = d["zipSize"]
        self.gz_size = d["gzSize"]
        self.sha256 = d["sha256"]

    def __str__(self) -> str:
        return "MetaInformation(" + "\nLast modified date: " + self.last_modified_date + "\n" + "Size: " + str(
            self.size) + "\n)"


if __name__ == '__main__':
    download("1.0")
    # download("1.1")
    #upload_file("requirements.txt")
