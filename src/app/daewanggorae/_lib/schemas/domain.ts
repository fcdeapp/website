export interface DomainSummary {
  domainId: string;
  title: { ko: string };
  bodyCharacters: number;
  estimatedPagesAt1500: number;
  targetPages: number;
  targetBodyCharacters: number;
  proseFraction: number;
  minimumBodyCharactersBeforeNextDomain: number;
  charactersToMinimum: number;
  minimumProseGatePassed: boolean;
  contentCoverageFraction: null;
  contentCoverageStatus: string;
  authoredSections: number;
  fullyVerifiedSections: number;
  subjectCount: number;
}
export interface DomainManifest {
  schemaVersion: string;
  id: string;
  title: { ko: string };
  subjects: Array<{ id: string; path: string }>;
  subjectIds: string[];
  targetPages: number;
  targetBodyCharacters: number;
  minimumProseFractionBeforeNextDomain: number;
  minimumBodyCharactersBeforeNextDomain: number;
  progressPath: string;
  readerPath: string;
  evidencePath: string;
  curriculumPath: string;
  coveragePath: string;
  questionIndex: string;
  sceneIndex: string;
  diagramIndex: string;
  referenceCatalog: string;
  crossDomainLessonRefs: string[];
  packageFile: string;
  sharedPackage: string;
}
export interface DomainIndex {
  schemaVersion: string;
  domains: Array<{ id: string; title: { ko: string }; path: string }>;
}
/** All manifest paths are relative to public/medicine, also in React Native adapters. */
export type ReadDatasetJSON = <T>(relativePath: string) => Promise<T>;
export async function loadDomain(
  readJSON: ReadDatasetJSON,
  domainId: string,
): Promise<DomainManifest> {
  const index = await readJSON<DomainIndex>("domains/index.json");
  const entry = index.domains.find((domain) => domain.id === domainId);
  if (!entry) throw new Error(`Unknown domain: ${domainId}`);
  return readJSON<DomainManifest>(entry.path);
}
