import getRegistryName = require('encode-registry') // TODO: remove this. BREAKING CHANGE
import createFetcher, {FetchedPackage, PackageContentInfo} from './fetch'
import pkgIdToFilename from './fs/pkgIdToFilename'
import {read, save, Store} from './fs/storeController'
import pkgIsUntouched from './pkgIsUntouched'
import {
  DirectoryResolution,
  PackageMeta,
  Resolution,
} from './resolvers'
import resolveStore from './resolveStore'

export {
  pkgIdToFilename,
  createFetcher,
  PackageContentInfo,
  FetchedPackage,
  DirectoryResolution,
  Resolution,
  PackageMeta,
  Store,
  read,
  save,
  getRegistryName,
  pkgIsUntouched,
  resolveStore,
}

export {
  ProgressLog,
  Log,
} from './loggers'
