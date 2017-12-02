import {PackageMeta} from '@pnpm/npm-resolver'
import {PackageJson} from '@pnpm/types'
import {LoggedPkg} from '../loggers'

export {PackageMeta}

/**
 * tarball hosted remotely
 */
export interface TarballResolution {
  type?: undefined,
  tarball: string,
  integrity?: string,
  // needed in some cases to get the auth token
  // sometimes the tarball URL is under a different path
  // and the auth token is specified for the registry only
  registry?: string,
}

/**
 * directory on a file system
 */
export interface DirectoryResolution {
  type: 'directory',
  directory: string,
}

/**
 * Git repository
 */
export interface GitRepositoryResolution {
  type: 'git',
  repo: string,
  commit: string,
}

export type Resolution =
  TarballResolution |
  GitRepositoryResolution |
  DirectoryResolution

export interface ResolveResult {
  id: string,
  resolution: Resolution,
  package?: PackageJson,
  latest?: string,
  normalizedPref?: string, // is null for npm-hosted dependencies
}

export interface ResolveOptions {
  auth: object,
  loggedPkg: LoggedPkg,
  storePath: string,
  registry: string,
  metaCache: Map<string, PackageMeta>,
  prefix: string,
  offline: boolean,
}

export interface WantedDependency {
  alias?: string,
  pref: string,
}

export type ResolveFunction = (wantedDependency: WantedDependency, opts: ResolveOptions) => Promise<ResolveResult>

export default function (resolverCreators: Array<(opts: object) => ResolveFunction>, opts: object) {
  const resolvers = resolverCreators.map((createResolver) => createResolver(opts))
  return resolver.bind(null, resolvers)
}

async function resolver (
  resolvers: ResolveFunction[],
  wantedDependency: WantedDependency,
  opts: ResolveOptions,
): Promise<ResolveResult> {
  for (const resolve of resolvers) {
    const resolution = await resolve(wantedDependency, opts)
    if (resolution) return resolution
  }
  throw new Error(`Cannot resolve ${wantedDependency.alias ? wantedDependency.alias + '@' : ''}${wantedDependency.pref} packages not supported`)
}
