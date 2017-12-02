import * as unpackStream from 'unpack-stream'
import {Resolution} from './combineResolvers'

export type IgnoreFunction = (filename: string) => boolean

export interface FetchOptions {
  auth?: object,
  cachedTarballLocation: string,
  pkgId: string,
  offline: boolean,
  prefix: string,
  ignore?: IgnoreFunction,
  onStart?: (totalSize: number | null, attempt: number) => void,
  onProgress?: (downloaded: number) => void,
}

export default function (
  fetchers: Array<{type: string, fetch: FetchFunction}>,
) {
  const fetcherByHostingType = fetchers.reduce((acc, f) => {
    acc[f.type] = f.fetch
    return acc
  }, {})
  return fetcher.bind(null, fetcherByHostingType)
}

export type FetchFunction = (
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
) => Promise<unpackStream.Index>

async function fetcher (
  fetcherByHostingType: {[hostingType: string]: FetchFunction},
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
): Promise<unpackStream.Index> {
  const fetch = fetcherByHostingType[resolution.type || 'tarball']
  if (!fetch) {
    throw new Error(`Fetching for dependency type "${resolution.type}" is not supported`)
  }
  return await fetch(resolution, target, opts)
}
