/**
 * TypeScript definitions for code generation schema
 */

export type FieldType = 'string' | 'int' | 'DateTime' | 'boolean';

export interface PropertyDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  autoIncrement?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  foreignKey?: string;
}

export interface RelationDefinition {
  navigationProperty: string;
  targetEntity: string;
  foreignKey: string;
}

export type PageOperation = 'list' | 'create' | 'update' | 'delete';

export interface OperationDefinition {
  type: PageOperation;
  requiredRole?: string;
}

export interface PageDefinition {
  entity: string;
  operations: OperationDefinition[];
  queryParams?: string[];
}

export interface RoleDefinition {
  name: string;
  setOnDefault: boolean;
}

export interface EntityDefinition {
  name: string;
  table: string;
  properties: PropertyDefinition[];
  relations?: RelationDefinition[];
}

export interface DefaultDefinitions {
  id: PropertyDefinition;
}

export interface DefinitionsSchema {
  entities: EntityDefinition[];
  defaults: DefaultDefinitions;
  roles: RoleDefinition[];
  pages: PageDefinition[];
}

// Load the JSON schema
import definitions from './definitions.json';
export default definitions as DefinitionsSchema;
