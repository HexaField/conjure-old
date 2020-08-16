
// import BaseStorage from '@forlagshuset/simple-fs/src/storages/base'

export default class simple_fs_libp2p {
  constructor (storageName = 'default', libp2p) {

    this.contentRouting = libp2p.contentRouting
    this.name = storageName
  }

  create (path, node, parentId) {
    return this.put(path, node, parentId)
  }

  async remove (path) {
    return this.contentRouting.put(path, {})
  }

  put (path, node, parentId) {
    return this.contentRouting.put(path, { path: path, node: node, parentId: parentId })
  }

  transaction (mode, cb) {
    // return this.storage.transaction(mode, this.storage.files, cb)
  }

  get (path) {
    return this.contentRouting.get(path)
  }

  getBy (key, value) {
    // const params = {}
    // params[key] = value

    // return this.storage.files.where(params).toArray()
  }

  where (params) {
    // return this.storage.files.where(params).toArray()
  }

  async isEmpty (parentId) {
    // const count = await this.storage.files.where({ parentId: parentId }).count()
    // return count === 0
  }
}