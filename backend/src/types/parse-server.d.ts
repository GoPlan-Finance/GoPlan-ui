// This file contain duplicate types from Parse-Server that are not yet updated

declare module 'parse-server' {
  
  export namespace Migrations {
    export type CPLType = '*' | ('find' | 'count' | 'get' | 'update' | 'create' | 'delete' /*| 'addField'*/)  []
    export type FieldType = 'String'
      | 'Number'
      | 'Boolean'
      | 'Date'
      | 'File'
      | 'GeoPoint'
      | 'Polygon'
      | 'Array'
      | 'Object'
      | 'Pointer'
      | 'Relation';


    interface FieldInterface {
      type : FieldType,
      targetClass? : string,
      required? : boolean,
      defaultValue? : any,
    }


    interface CPLInterface {
      requiresAuthentication? : boolean,
      '*'? : boolean,
    }


    interface IndexInterface {
      [key : string] : number,
    }


    interface FieldsInterface {
      [key : string] : FieldInterface,
    }


    interface ProtectedFieldsInterface {
      [key : string] : string[],
    }


    interface IndexesInterface {
      [key : string] : IndexInterface,
    }


    interface CPLsInterface {
      find? : CPLInterface,
      count? : CPLInterface,
      get? : CPLInterface,
      update? : CPLInterface,
      create? : CPLInterface,
      delete? : CPLInterface,
      addField? : CPLInterface,
      protectedFields? : ProtectedFieldsInterface
    }


    export interface SchemaInterface {
      fields : FieldsInterface,
      indexes : IndexesInterface,
      classLevelPermissions : CPLsInterface,
    }


    export function runMigrations (schemas : SchemaInterface[]) : void;

    export function makeSchema (className : string, schema : SchemaInterface) : SchemaInterface;

    export function requiresAuthentication (ops : CPLType) : CPLsInterface;

    export function requiresAnonymous (ops : CPLType) : CPLsInterface;
  }
}

