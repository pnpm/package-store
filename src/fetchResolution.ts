import fetchFromGit from '@pnpm/git-fetcher'
import logger from '@pnpm/logger'
import {IncomingMessage} from 'http'
import fs = require('mz/fs')
import path = require('path')
import * as unpackStream from 'unpack-stream'
import {PnpmError} from './errorTypes'
import {progressLogger} from './loggers'
import {Got} from './network/got'
import {Resolution} from './resolve'

const gitLogger = logger('git')

const fetchLogger = logger('fetch')

export type IgnoreFunction = (filename: string) => boolean

export interface FetchOptions {
  auth?: object,
  cachedTarballLocation: string,
  pkgId: string,
  offline: boolean,
  prefix: string,
  ignore?: IgnoreFunction,
  download (url: string, saveto: string, opts: {
    auth?: object,
    unpackTo: string,
    registry?: string,
    onStart?: (totalSize: number | null, attempt: number) => void,
    onProgress?: (downloaded: number) => void,
    ignore?: (filename: string) => boolean,
    integrity?: string
    generatePackageIntegrity?: boolean,
  }): Promise<{}>,
}

export interface PackageDist {
  tarball: string,
  registry?: string,
  integrity?: string,
}

export default async function fetchResolution (
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
): Promise<unpackStream.Index> {
  switch (resolution.type) {

    case undefined:
      const dist = {
        integrity: resolution.integrity,
        registry: resolution.registry,
        tarball: resolution.tarball,
      }
      return await fetchFromTarball(target, dist, opts) as unpackStream.Index

    case 'git':
      return await fetchFromGit(resolution, target)

    default: {
      throw new Error(`Fetching for dependency type "${resolution.type}" is not supported`)
    }
  }
}

export function fetchFromTarball (dir: string, dist: PackageDist, opts: FetchOptions) {
  if (dist.tarball.startsWith('file:')) {
    dist = Object.assign({}, dist, {tarball: path.join(opts.prefix, dist.tarball.slice(5))})
    return fetchFromLocalTarball(dir, dist, opts.ignore)
  } else {
    return fetchFromRemoteTarball(dir, dist, opts)
  }
}

export async function fetchFromRemoteTarball (dir: string, dist: PackageDist, opts: FetchOptions) {
  try {
    const index = await fetchFromLocalTarball(dir, {
      integrity: dist.integrity,
      tarball: opts.cachedTarballLocation,
    }, opts.ignore)
    fetchLogger.debug(`finish ${dist.integrity} ${dist.tarball}`)
    return index
  } catch (err) {
    if (err.code !== 'ENOENT') throw err

    if (opts.offline) {
      throw new PnpmError('NO_OFFLINE_TARBALL', `Could not find ${opts.cachedTarballLocation} in local registry mirror`)
    }
    return await opts.download(dist.tarball, opts.cachedTarballLocation, {
      auth: opts.auth,
      ignore: opts.ignore,
      integrity: dist.integrity,
      onProgress: (downloaded) => {
        progressLogger.debug({status: 'fetching_progress', pkgId: opts.pkgId, downloaded})
      },
      onStart: (size, attempt) => {
        progressLogger.debug({status: 'fetching_started', pkgId: opts.pkgId, size, attempt})
      },
      registry: dist.registry,
      unpackTo: dir,
    })
  }
}

async function fetchFromLocalTarball (
  dir: string,
  dist: PackageDist,
  ignore?: IgnoreFunction,
): Promise<unpackStream.Index> {
  return await unpackStream.local(
    fs.createReadStream(dist.tarball),
    dir,
    {
      ignore,
    },
  ) as unpackStream.Index
}
