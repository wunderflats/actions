// SnykTestReportVulnerability and SnykTestReport are the partial types, for the full types see the Snyk documentation:
// https://snyk.docs.apiary.io/#introduction/overview-and-entities
export interface SnykTestReportVulnerability {
  title: string;
  description: string;
  moduleName: string;
  language: string;
  packageManager: string;
  severity: string;
  creationTime: string;
  modificationTime: string;
  publicationTime: string;
  disclosureTime: string;
  id: string;
  packageName: string;
  version: string;
  name: string;
  isUpgradable: false;
  isPatchable: false;
}

export interface SnykTestReport {
  ok: boolean;
  projectName: string;
  vulnerabilities: SnykTestReportVulnerability[];
  dependencyCount: number;
  org: string;
  isPrivate: boolean;
  packageManager: string;
  summary: string;
}

export interface SnykCodeTestReportVulnerability {
  level: string;
  ruleId: string;
  message: {
    text: string;
  };
  locations: {
    physicalLocation: {
      artifactLocation: {
        uri: string;
      };
      region: {
        startLine: number;
      };
    };
  }[];
}
export interface SnykCodeTestReport {
  runs: {
    tool: {
      driver: {
        rules: {
          id: string;
          shortDescription: {
            text: string;
          };
        }[];
      };
    };
    results: SnykCodeTestReportVulnerability[];
  }[];
}
