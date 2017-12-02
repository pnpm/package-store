import getRegistryName = require('encode-registry') // TODO: remove this. BREAKING CHANGE
import {
  DirectoryResolution,
  PackageMeta,
  Resolution,
} from './createResolver'
import createFetcher, {FetchedPackage, PackageContentInfo} from './fetch'
import pkgIdToFilename from './fs/pkgIdToFilename'
import {read, save, Store} from './fs/storeController'
import pkgIsUntouched from './pkgIsUntouched'
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
