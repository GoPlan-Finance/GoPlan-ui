import VueStore from 'vue-class-store'
import {User} from '../../models'

import {Crypto, EncryptedValue} from '../../../../common/Crypto'
import {Session} from './index'

interface ClientKeyInterface {
    encryptionKey: string,
}

export class Auth {

  public async signOut () : Promise<Parse.User> {

    return Parse.User.logOut()
  }

  public async currentUser (): Promise<User | null> {

    return await Parse.User.currentAsync()
  }


  public async isAuthenticated (): Promise<boolean> {
    return true;
    return !!await this.currentUser()
  }

  public async isConnected (): Promise<boolean> {

    return !!Session.get('encryptionKey')
  }


  public async isMasterKeyValid (masterKey :string): Promise<boolean> {
    try {
      await this.decryptClientKey(masterKey)
      return true
    } catch (err) {
      console.log('invalid master key')
    }

    return false
  }

  public async decryptClientKey (masterKey: string): Promise<void> {
    const user = await this.currentUser()

    if (!await this.hasClientKey()) {
      throw 'No client key'
    }

    const clientKey = user.get('clientKey')
    const key       = Crypto.decrypt(masterKey, clientKey) as ClientKeyInterface

    if (!key || typeof key !== 'object') {
      throw 'Invalid key'
    }

    // @todo ensure SessionStorage is safe storage for tokens
    Session.set('encryptionKey', key.encryptionKey)
  }


  public async hasClientKey (): Promise<boolean> {
    const user = await this.currentUser()

    const clientKey = user.get('clientKey')
    if (clientKey) {

      // check if anything is missing
      return ![
        'ct', 's', 'iv'
      ].some(
        f => typeof clientKey[f] !== 'string' || clientKey[f].length === 0
      )
    }

    return false
  }

  public async createMasterKey (newMasterKey: string) : Promise<EncryptedValue> {
    if (await this.hasClientKey()) {
      throw 'Master Key already exists'
    }

    //
    // In a very simple case, all the user's data would be encrypted with the MasterKey, but
    // since the user may want to change its MasterKey at some point, we really dont want to have to decrypt/encrypt
    // the entire database with his new MasterKey. Therefore, instead we generate a random EncryptionKey and use
    // the user's MasterKey to secure the EncryptionKey.
    //

    // 2. We generate our super secret key that we will use to actually encrypt the user's data
    const encryptionKey = Crypto.randomWords(128 / 8)

    return Crypto.encrypt(newMasterKey, {
      encryptionKey
    })
  }


  // public async updateMasterKey (oldMasterKey, newMasterKey) {
  //   throw 'tbd'
  // }


}


@VueStore
export class AuthStore extends Auth {


}
