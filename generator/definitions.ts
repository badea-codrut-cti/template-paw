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
}

// Load the JSON schema
const definitions: DefinitionsSchema = require('./definitions.json');

export default definitions;
