// import BaseStorage from '@forlagshuset/simple-fs/src/storages/base'

export default class simple_fs_libp2p
{
    constructor (storageName)
    {
        this.db = undefined
        this.name = String(storageName)
    }

    async close()
    {
        return await this.db.close()
    }

    async initialise(orbitdb)
    {
        this.db = await orbitdb.keyvalue(this.name)
    }

    async create(path, node, parentId)
    {
        return await this.put(path, node, parentId)
    }

    async remove(path)
    {
        return await this.db.del(path)
    }

    async put(path, node, parentId)
    {
        return await this.db.put(path, { path: path, node: node, parentId: parentId })
    }

    // async transaction(mode, cb)
    // {
    // }

    async get(path)
    {
        return this.db.get(path)
    }

    async where(params)
    {
        const paramsKeys = Object.keys(params)
        const ret = []
    
        Object.keys(this.db.all).forEach((d) => {
            let canBe = true
            const object = this.db.all[d]
            paramsKeys.forEach((param) => {
              if (object[param] !== params[param]) canBe = false
            })
            if (canBe) ret.push(object)
        })
        return ret
    }

    async isEmpty(parentId)
    {
      let count = 0
      const keys = Object.keys(this.db.all)
  
      for (let i = 0; i < keys.length; i++) {
        if (this.db.all[keys[i]].parentId === parentId) {
          count += 1
        }
      }
      return count === 0
    }
}