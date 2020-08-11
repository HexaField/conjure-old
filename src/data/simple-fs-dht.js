
// import BaseStorage from '@forlagshuset/simple-fs/src/storages/base'

export default class DHT {
  constructor (storageName = 'default', dht) {
    // super(storageName)

    this.dht = dht
    this.name = 'indexeddb'
  }

  create (path, node, parentId) {
    return this.put(path, node, parentId)
  }

  async remove (path) {
    return this.dht.put(path, {})
  }

  put (path, node, parentId) {
    return this.dht.put(path, { path: path, node: node, parentId: parentId })
  }

  transaction (mode, cb) {
    // return this.storage.transaction(mode, this.storage.files, cb)
  }

  get (path) {
    return this.dht.get(path)
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