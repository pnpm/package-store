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

export type FetchFunction = (
  resolution: Resolution,
  target: string,
  opts: FetchOptions,
) => Promise<unpackStream.Index>
