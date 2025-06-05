/**
 * Application description data for code generation.
 * Contains entities, default id, roles and page definitions.
 */

import type { DefinitionsSchema } from './definitions';

const appDescription: DefinitionsSchema = {
  entities: [
    {
      name: "Concurs",
      table: "CONCURS",
      properties: [
        { name: "Nume", type: "string", required: true, minLength: 3, maxLength: 100 },
        { name: "Data", type: "DateTime", required: true },
        { name: "Categorie", type: "string", required: true, minLength: 3, maxLength: 50 },
        { name: "NrMaxParticipanti", type: "int", required: true, min: 1, max: 100 },
        { name: "RestrictieVarsta", type: "boolean", required: true }
      ],
      relations: [
        { navigationProperty: "Concurs", targetEntity: "Concurs" }
      ]
    },
    {
      name: "Concurent",
      table: "CONCURENT",
      properties: [
        { name: "Nume", type: "string", required: true, minLength: 2, maxLength: 50 },
        { name: "Prenume", type: "string", required: true, minLength: 2, maxLength: 50 },
        { name: "DataNasterii", type: "DateTime", required: true },
        { name: "Tara", type: "string", required: true, minLength: 2, maxLength: 50 },
        { name: "ConcursId", type: "int", required: true }
      ],
      relations: [
        { navigationProperty: "Concurs", targetEntity: "Concurs" }
      ]
    }
  ],
  defaults: {
    id: { name: "Id", type: "int", required: true, autoIncrement: true }
  },
  roles: [
    { name: "Admin", setOnDefault: true }
  ],
  pages: [
    {
      entity: "Concurs",
      operations: [
        { type: "list" },
        { type: "create", requiredRole: "Admin" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ]
    },
    {
      entity: "Concurent",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ]
    }
  ]
};

export default appDescription;
