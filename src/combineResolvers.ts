import {PackageMeta} from '@pnpm/npm-resolver'
import {PackageJson} from '@pnpm/types'
import {LoggedPkg} from './loggers'

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

export type Resolution =
  TarballResolution |
  DirectoryResolution |
  ({ type: string } & object)

export interface ResolveResult {
  id: string,
  resolution: Resolution,
  package?: PackageJson,
  latest?: string,
  normalizedPref?: string, // is null for npm-hosted dependencies
}

export interface ResolveOptions {
  auth: object,
  storePath: string, // TODO: move out to shared opts
  registry: string,
  metaCache: Map<string, PackageMeta>, // TODO: move out to shared opts
  prefix: string,
  offline: boolean, // TODO: move out to shared opts
}

export interface WantedDependency {
  alias?: string,
  pref: string,
}

export type ResolveFunction = (wantedDependency: WantedDependency, opts: ResolveOptions) => Promise<ResolveResult>

export default function combineResolvers (resolvers: ResolveFunction[]) {
  return combineAndRunResolvers.bind(null, resolvers)
}

async function combineAndRunResolvers (
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
