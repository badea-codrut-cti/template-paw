/**
 * Application description data for code generation.
 * Contains entities, default id, roles and page definitions.
 */

import type { DefinitionsSchema } from './definitions';

const appDescription: DefinitionsSchema = {
  projectName: "AspPrep",
  entities: [
    {
      name: "Concurs",
      table: "CONCURS",
      properties: [
        { name: "Nume", type: "string", required: true, minLength: 3, maxLength: 100 },
        { name: "Data", type: "DateTime", required: true },
        {
          name: "Categorie",
          type: "string",
          required: true,
          minLength: 3,
          maxLength: 50,
          regex: "^[A-Za-z]+$"
        },
        { name: "NrMaxParticipanti", type: "int", required: true, min: 1, max: 100 },
        { name: "RestrictieVarsta", type: "boolean", required: true }
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
      ],
      relations: [
        { navigationProperty: "Concurs", targetEntity: "Concurs" }
      ]
    },
    {
      name: "Band",
      table: "BAND",
      properties: [
        { name: "Name", type: "string", required: true, minLength: 2, maxLength: 50 }
      ]
    },
    {
      name: "Singer",
      table: "SINGER",
      properties: [
        { name: "Name", type: "string", required: true, minLength: 2, maxLength: 50 }
      ]
    }
  ],
  manyToMany: [
    {
      entityA: "Singer",
      entityB: "Band",
      joinEntity: "SingerBand",
      table: "SINGER_BAND"
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
      ],
      searchFields: ["Nume", "Categorie"]
    },
    {
      entity: "Concurent",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Nume", "Prenume", "Tara"]
    },
    {
      entity: "Band",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Name"]
    },
    {
      entity: "Singer",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Name"]
    }
  ]
};

export default appDescription;
