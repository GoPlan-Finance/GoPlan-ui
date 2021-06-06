import { Crypto, DerivedKey, EncryptedValue } from '../..//Crypto'
import { BaseObject } from './BaseObject'


const perf = {
  time : 0,
  ops  : 0,
}


export abstract class SecureObject extends BaseObject {

  private static isServer                  = false
  private static sessionDerivedKey : DerivedKey
  private readonly secureFields : string[] = []

  private _decryptedReadCache : { [key : string] : unknown } = {}
  private _dirtyCache : { [key : string] : boolean }         = {}

  public static setServerMode () : void {
    SecureObject.isServer = true
  }

  protected constructor (className : string, secureFields : string[]) {
    super(className)

    this.secureFields = secureFields
  }

  static setSessionDerivedKey (derived : DerivedKey) : void {
    SecureObject.sessionDerivedKey = derived
  }

  public _secureFields () : string[] {
    return this.secureFields
  }

  public async decrypt () : Promise<void> {
    if (SecureObject.isServer) {
      return
    }

    if (!SecureObject.sessionDerivedKey) {
      throw 'Encryption key not set"'
    }

    await Promise.all(
      this.secureFields.map(async fieldName => {
        const val = super.get(fieldName)

        if (val === undefined || val === null) {
          return // Skip null/undefined values. This will occur if we add new encrypted fields to the schema.
        }

        this._dirtyCache[fieldName]         = false
        this._decryptedReadCache[fieldName] = Crypto.isEncrypted(val) ? await SecureObject.decryptField(val) : val
      },
      ))
  }

  clone () : any {
    const clone = super.clone()


    for (const [
      k, v
    ] of Object.entries(clone._decryptedReadCache)) {
      this._decryptedReadCache[k] = v
    }
    return clone
  }


  public static async decryptField<T> (val : EncryptedValue) : Promise<T> {

    const start = window.performance.now()

    const decrypted = await Crypto.decrypt<T>(SecureObject.sessionDerivedKey, val)

    perf.time += window.performance.now() - start
    //console.log(++perf.ops, perf.time)
    return decrypted
  }

  public static async encryptField<T> (val : T) : Promise<EncryptedValue> {

    if (Crypto.isEncrypted(val as unknown as EncryptedValue)) {

      throw 'Already encrypted'

      return val as unknown as EncryptedValue
    }


    if (val instanceof Parse.Object) {
      throw 'When setting Secure Fields, you cannot persists objects themselves, you need to use "myObject.toPointer()"'
    }

    return await Crypto.encrypt(SecureObject.sessionDerivedKey, val)
  }

  private async encrypt () {
    for (const [
      fieldName, isDirty
    ] of Object.entries(this._dirtyCache)) {

      if (!isDirty) {
        continue
      }

      const value = this._decryptedReadCache[fieldName]

      super.set(fieldName, await SecureObject.encryptField(value))
    }
  }

  async save (
    target : SecureObject | Array<SecureObject | Parse.File> = undefined,
    options : Parse.RequestOptions                           = undefined,
  ) : Promise<this> {

    await this.encrypt()

    const savedObject = await super.save(target, options)

    return savedObject
  }


  public get<T> (attr : string) : T {

    const val = super.get(attr)

    if (SecureObject.isServer || !this.secureFields.includes(attr)) {
      return val
    }

    return this._decryptedReadCache[attr] as T
  }


  public set<T> (
    key : string | { [key : string] : unknown },
    value : T | undefined = undefined,
    options : unknown     = undefined,
  ) : this | false {

    if (SecureObject.isServer) {
      return super.set(key as string, value, options)
    }

    if (!SecureObject.sessionDerivedKey) {
      throw 'Encryption key not set"'
    }

    const setValue = (k : string, v : unknown) => {

      if (!this.secureFields.includes(k)) {
        return super.set(k as string, v, options)
      }

      if (v instanceof Parse.Object) {
        throw 'When setting Secure Fields, you cannot persists objects themselves, you need to use "myObject.toPointer()"'
      }

      this._dirtyCache[k]         = true
      this._decryptedReadCache[k] = v

      return this
    }

    if (key && typeof key === 'object') {

      for (const k in key) {

        if (!Object.prototype.hasOwnProperty.call(key, k)) {
          continue
        }

        setValue(k, key[k])
      }

      return this
    }


    return setValue(key as string, value)
  }


  public static async saveAll<T extends readonly Parse.Object[]> (
    list : T,
    options? : Parse.Object.SaveAllOptions,
  ) : Promise<T> {

    for (const obj of list) {
      if (obj instanceof SecureObject) {
        await obj.encrypt()
      }
    }

    return super.saveAll(list, options)
  }

}


