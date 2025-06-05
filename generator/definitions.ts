/**
 * Code generation schema type definitions.
 */

/**
 * Allowed primitive field types.
 */
export type FieldType = 'string' | 'int' | 'float' | 'DateTime' | 'boolean';

/**
 * Base definition for any property.
 */
export interface BaseProperty {
  name: string;
  type: FieldType;
  required: boolean;
  autoIncrement?: boolean;
}

/**
 * String property supports only min/max length.
 */
export interface StringPropertyDefinition extends BaseProperty {
  type: 'string';
  minLength?: number;
  maxLength?: number;
}

/**
 * Numeric property supports only min/max value.
 */
export interface NumericPropertyDefinition extends BaseProperty {
  type: 'int' | 'float';
  min?: number;
  max?: number;
}

/**
 * DateTime property (no extra constraints).
 */
export interface DatePropertyDefinition extends BaseProperty {
  type: 'DateTime';
}

/**
 * Boolean property (no extra constraints).
 */
export interface BooleanPropertyDefinition extends BaseProperty {
  type: 'boolean';
}

/**
 * A property must be one of the specialized definitions.
 */
export type PropertyDefinition =
  | StringPropertyDefinition
  | NumericPropertyDefinition
  | DatePropertyDefinition
  | BooleanPropertyDefinition;

/**
 * Define a relation between entities by entity name.
 */
export interface RelationDefinition {
  navigationProperty: string;
  targetEntity: string;
}

/**
 * CRUD operations for Razor Pages, with optional role restriction.
 */
export type PageOperation = 'list' | 'create' | 'update' | 'delete';

export interface OperationDefinition {
  type: PageOperation;
  requiredRole?: string;
}

/**
 * Page definition grouping operations for an entity.
 */
export interface PageDefinition {
  entity: string;
  operations: OperationDefinition[];
  queryParams?: string[];
}

/**
 * Roles available in the app, with default assignment.
 */
export interface RoleDefinition {
  name: string;
  setOnDefault: boolean;
}

/**
 * Entity schema definition.
 */
export interface EntityDefinition {
  name: string;
  table: string;
  properties: PropertyDefinition[];
  relations?: RelationDefinition[];
}

/**
 * Default definitions (e.g. implicit id).
 */
export interface DefaultDefinitions {
  id: NumericPropertyDefinition;
}

/**
 * Root schema for code generation definitions.
 */
export interface DefinitionsSchema {
  entities: EntityDefinition[];
  defaults: DefaultDefinitions;
  roles: RoleDefinition[];
  pages: PageDefinition[];
}
