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
        { name: "Nume", type: "string", required: true, minLength: 3, maxLength: 100, showInRelations: true },
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
        { name: "Nume", type: "string", required: true, minLength: 2, maxLength: 50, showInRelations: true },
        { name: "Prenume", type: "string", required: true, minLength: 2, maxLength: 50, showInRelations: true },
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
        { name: "Name", type: "string", required: true, minLength: 2, maxLength: 50, showInRelations: true }
      ]
    },
    {
      name: "Singer",
      table: "SINGER",
      properties: [
        { name: "Name", type: "string", required: true, minLength: 2, maxLength: 50, showInRelations: true }
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
      searchFields: ["Nume", "Categorie"],
      sortBy: ["Nume", "Data"]
    },
    {
      entity: "Concurent",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Nume", "Prenume", "Tara"],
      sortBy: ["Nume", "Prenume"]
    },
    {
      entity: "Band",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Name"],
      sortBy: ["Name"]
    },
    {
      entity: "Singer",
      operations: [
        { type: "list" },
        { type: "create" },
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ],
      searchFields: ["Name"],
      sortBy: ["Name"]
    }
  ],
  seedUsers: [
    {
      email: "oreoezi@oreo.ac",
      password: "Bobita1!",
      roles: ["Admin"]
    }
  ]
};

export default appDescription;
