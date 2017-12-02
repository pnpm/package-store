import * as unpackStream from 'unpack-stream'
import {Resolution} from './resolvers'

export type IgnoreFunction = (filename: string) => boolean

export interface FetchOptions {
  auth?: object, //// TODO: move out to shared opts?!
  cachedTarballLocation: string,
  pkgId: string,
  offline: boolean, // TODO: move out to shared opts
  prefix: string,
  ignore?: IgnoreFunction, // TODO: move out to shared opts
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
