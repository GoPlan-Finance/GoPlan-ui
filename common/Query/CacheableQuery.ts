/**
 *
 *
 *
 */
import { BaseObject } from '/@common/models/base/BaseObject'
import { Query } from '/@common/Query'
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-rest-params */
import * as CryptoJS from 'crypto-js'
import { Constructible, PointerInterface } from './Query'

type CacheItemType<T> = { [key : string] : Promise<T> }
type HandlerFn<T> = () => Promise<T>


export class CacheableQuery<T extends BaseObject> extends Query<T> {

  private static CACHE : unknown = {}

  static create<U extends BaseObject> (objectClass : Constructible<U>) : CacheableQuery<U> {
    return new CacheableQuery<U>(objectClass)
  }

  public  async findBy (
    params : { [key : string] : string | boolean | number | BaseObject | Parse.Pointer },
    useMasterKey = false,
  ) : Promise<T[]> {

    return this.handleCache<T[]>('findBy', arguments, () => {
      return super.findBy(params, useMasterKey)
    })
  }

  public async findOneBy<K extends Extract<keyof T, string>> (
    params : Partial<Pick<T, K>> | T,
    useMasterKey = false,
  ) : Promise<T | undefined> {

    return this.handleCache<T>('findOneBy', arguments, () => {
      return super.findOneBy(params, useMasterKey)
    })
  }

  public  async findOrCreate<K extends Extract<keyof T, string>> (
    params : Partial<Pick<T, K>> | T,
    useMasterKey = false,
    save         = true,
    createParams : Partial<Pick<T, K>> | T  | undefined = undefined,
  ) : Promise<T> {

    return this.handleCache<T>('findOrCreate', arguments, () => {
      return super.findOrCreate(params, useMasterKey, save, createParams)
    })
  }

  public  async getObjectById (
    docId : string | PointerInterface | T,
    useMasterKey = false,
  ) : Promise<T> {

    return this.handleCache<T>('getObjectById', arguments, () => {
      return super.getObjectById(docId, useMasterKey)
    })
  }

  public  async getOrNull (
    docId : string,
    useMasterKey = false,
  ) : Promise<T> {

    return this.handleCache<T>('getOrNull', arguments, () => {
      return super.getOrNull(docId, useMasterKey)
    })

  }


  protected async handleCache<U> (methodName : string, params : unknown, fn : HandlerFn<U>) : Promise<U> {

    const CACHE = CacheableQuery.CACHE as CacheItemType<U>

    const hash = CryptoJS.MD5(methodName + JSON.stringify(params)).toString()

    if (CACHE[hash] /* if previous query returned null or undefined, we will do the query again */) {
      return CACHE[hash] as Promise<U>
    }

    CACHE[hash] = fn()

    return CACHE[hash] as Promise<U>
  }

}
