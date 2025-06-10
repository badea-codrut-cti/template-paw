#!/usr/bin/env node

/**
 * Code generator CLI tool
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import appDescription from './appdescription';
import { GeneratorEntityDefinition } from './definitions';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateSchema() {
  for (const entity of appDescription.entities) {
    if (entity.relations) {
      for (const rel of entity.relations) {
        const target = appDescription.entities.find(e => e.name === rel.targetEntity);
        if (!target) {
          console.warn(
            chalk.yellow(
              `Warning: Entity "${entity.name}" has relation "${rel.navigationProperty}" referencing missing entity "${rel.targetEntity}"`
            )
          );
        }
      }
    }
  }
  if (appDescription.manyToMany) {
    for (const mm of appDescription.manyToMany) {
      const aExists = appDescription.entities.some(e => e.name === mm.entityA);
      const bExists = appDescription.entities.some(e => e.name === mm.entityB);
      if (!aExists || !bExists) {
        console.warn(
          chalk.yellow(
            `Warning: many-to-many "${mm.joinEntity}" references unknown entity${!aExists && !bExists ? 'ies' : ''} ` +
              `${!aExists ? mm.entityA : ''}${!aExists && !bExists ? ' and ' : ''}${!bExists ? mm.entityB : ''}`
          )
        );
      }
    }
  }
}

const program = new Command();

program
  .name('generate')
  .description('Generate ASP.NET Core code from schema')
  .version('1.0.0');

program
  .command('models')
  .description('Generate entity models')
  .action(async () => {
    console.log(chalk.blue('Generating models...'));
    await generateModels();
    console.log(chalk.green('✓ Models generated'));
  });

program
  .command('context')
  .description('Generate DbContext')
  .action(async () => {
    console.log(chalk.blue('Generating DbContext...'));
    await generateDbContext();
    console.log(chalk.green('✓ DbContext generated'));
  });

program
  .command('controllers')
  .description('Generate controllers and views')
  .action(async () => {
    console.log(chalk.blue('Generating controllers and views...'));
    await generateControllers();
    console.log(chalk.green('✓ Controllers and views generated'));
  });

program
  .command('layout')
  .description('Generate shared layout')
  .action(async () => {
    console.log(chalk.blue('Generating layout...'));
    await generateLayout();
    console.log(chalk.green('✓ Layout generated'));
  });

program
  .command('seedusers')
  .description('Generate seed users file')
  .action(async () => {
    console.log(chalk.blue('Generating seed users...'));
    await generateSeedUsers();
    console.log(chalk.green('✓ Seed users generated'));
  });

program
  .command('all')
  .description('Generate all code')
  .action(async () => {
    console.log(chalk.blue('Generating all code...'));
    await generateModels();
    await generateDbContext();
    await generateControllers();
    await generateLayout();
    await generateSeedUsers();
    console.log(chalk.green('✓ All code generated'));
  });

async function generateModels() {
  const template = await fs.readFile(path.join(__dirname, 'templates', 'Model.hbs'), 'utf8');
  const compile = Handlebars.compile(template);

  const allEntities = getAllEntities();
  for (const entity of allEntities) {
    const properties = getModelProperties(entity);
    const content = compile({ entity, properties });
    const outputPath = path.join('AspPrep', 'Models', `${entity.name}.cs`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
    console.log(chalk.gray(`  Generated ${outputPath}`));
  }
}

async function generateDbContext() {
  const template = await fs.readFile(path.join(__dirname, 'templates', 'DbContext.hbs'), 'utf8');
  const compile = Handlebars.compile(template);

  const allEntities = getAllEntities();
  const content = compile({
    entities: allEntities,
    namespace: 'AspPrep.Data'
  });
  
  const outputPath = path.join('AspPrep', 'Data', 'ApplicationDbContext.cs');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content);
  console.log(chalk.gray(`  Generated ${outputPath}`));
}

function getAllEntities(): GeneratorEntityDefinition[] {
  const entities: GeneratorEntityDefinition[] = [...appDescription.entities];
  if (appDescription.manyToMany) {
    for (const mm of appDescription.manyToMany) {
      const joinEntity: GeneratorEntityDefinition = {
        name: mm.joinEntity,
        table: mm.table,
        isJoinEntity: true,
        properties: [
          { name: `${mm.entityA}Id`, type: 'int', required: true },
          { name: `${mm.entityB}Id`, type: 'int', required: true }
        ],
        relations: [
          { navigationProperty: mm.entityA, targetEntity: mm.entityA },
          { navigationProperty: mm.entityB, targetEntity: mm.entityB }
        ]
      };
      entities.push(joinEntity);
    }
  }
  return entities;
}

function getModelProperties(entity: GeneratorEntityDefinition) {
  if (entity.isJoinEntity) {
    return entity.properties;
  }
  const fkProps = entity.relations
    ? entity.relations.map((r: any) => ({ name: `${r.navigationProperty}Id`, type: 'int', required: true }))
    : [];
  return [appDescription.defaults.id, ...entity.properties, ...fkProps];
}

function getDisplayProperties(entityName: string): string[] {
  const entity = appDescription.entities.find(e => e.name === entityName);
  if (!entity) return ['Id'];
  const props = entity.properties
    .filter((p: any) => (p as any).showInRelations)
    .map(p => p.name);
  return props.length ? props : ['Id'];
}

function buildInterpolation(varName: string, nav: string, props: string[]): string {
  const inner = props.map(p => `{${varName}.${nav}.${p}}`).join(' ');
  return `$"${inner}"`;
}

function buildSelectExpression(props: string[], varName: string = 'm'): string {
  const inner = props.map(p => `{${varName}.${p}}`).join(' ');
  return `$"${inner}"`;
}

function getManyToManyForEntity(entityName: string) {
  if (!appDescription.manyToMany) return [] as any[];
  const mms: any[] = [];
  for (const mm of appDescription.manyToMany) {
    if (mm.entityA === entityName) {
      const props = getDisplayProperties(mm.entityB);
      mms.push({
        joinEntity: mm.joinEntity,
        otherEntity: mm.entityB,
        thisKey: `${mm.entityA}Id`,
        otherKey: `${mm.entityB}Id`,
        selectExpression: buildSelectExpression(props),
        detailsSelectExpression: buildSelectExpression(props, `j.${mm.entityB}`)
      });
    } else if (mm.entityB === entityName) {
      const props = getDisplayProperties(mm.entityA);
      mms.push({
        joinEntity: mm.joinEntity,
        otherEntity: mm.entityA,
        thisKey: `${mm.entityB}Id`,
        otherKey: `${mm.entityA}Id`,
        selectExpression: buildSelectExpression(props),
        detailsSelectExpression: buildSelectExpression(props, `j.${mm.entityA}`)
      });
    }
  }
  return mms;
}

async function generateControllers() {
  const controllerTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Controller.hbs'), 'utf8');
  const indexTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Index.hbs'), 'utf8');
  const createTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Create.hbs'), 'utf8');
  const editTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Edit.hbs'), 'utf8');
  const deleteTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Delete.hbs'), 'utf8');
  const detailsTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Details.hbs'), 'utf8');
  
  const compileController = Handlebars.compile(controllerTemplate);
  const compileIndex = Handlebars.compile(indexTemplate);
  const compileCreate = Handlebars.compile(createTemplate);
  const compileEdit = Handlebars.compile(editTemplate);
  const compileDelete = Handlebars.compile(deleteTemplate);
  const compileDetails = Handlebars.compile(detailsTemplate);
  
  for (const pageConfig of appDescription.pages) {
    const entity = appDescription.entities.find(e => e.name === pageConfig.entity);
    if (!entity) {
      console.warn(chalk.yellow(`Warning: Entity "${pageConfig.entity}" not found for page definition`));
      continue;
    }

    const relationsWithDisplay = entity.relations?.map(r => {
      const props = getDisplayProperties(r.targetEntity);
      return {
        ...r,
        displayProperties: props,
        displayInterpolationItem: buildInterpolation('item', r.navigationProperty, props),
        displayInterpolationModel: buildInterpolation('Model', r.navigationProperty, props),
        selectExpression: buildSelectExpression(props)
      };
    });

    const manyToMany = getManyToManyForEntity(entity.name);
    const entityForViews = { ...entity, relations: relationsWithDisplay };

    const searchFieldDefs = pageConfig.searchFields?.map(f => {
      const prop = entity.properties.find(p => p.name === f);
      return { name: f, type: prop?.type || 'string' };
    });

    const entityWithFk: GeneratorEntityDefinition = {
      ...entity,
      relations: relationsWithDisplay,
      properties: getModelProperties(entity).slice(1) // remove default id for controllers
    };

    // Generate controller
    const opsWithDetails = [...pageConfig.operations];
    if (opsWithDetails.some(o => o.type === 'list')) {
      opsWithDetails.push({ type: 'details' });
    }

    const controllerContent = compileController({ entity: entityWithFk, pageConfig: { ...pageConfig, operations: opsWithDetails }, searchFieldDefs, manyToMany });
    const controllerPath = path.join('AspPrep', 'Controllers', `${entity.name}Controller.cs`);
    await fs.ensureDir(path.dirname(controllerPath));
    await fs.writeFile(controllerPath, controllerContent);
    console.log(chalk.gray(`  Generated ${controllerPath}`));
    
    // Generate views
    const viewsDir = path.join('AspPrep', 'Views', entity.name);
    await fs.ensureDir(viewsDir);
    
    for (const operation of opsWithDetails) {
      let template, filename;
      switch (operation.type) {
        case 'list':
          template = compileIndex;
          filename = 'Index.cshtml';
          break;
        case 'create':
          template = compileCreate;
          filename = 'Create.cshtml';
          break;
        case 'update':
          template = compileEdit;
          filename = 'Edit.cshtml';
          break;
        case 'delete':
          template = compileDelete;
          filename = 'Delete.cshtml';
          break;
        case 'details':
          template = compileDetails;
          filename = 'Details.cshtml';
          break;
      }

      if (template) {
        const viewContent = template({ entity: entityForViews, operation, pageConfig, searchFieldDefs, manyToMany });
        const viewPath = path.join(viewsDir, filename);
        await fs.writeFile(viewPath, viewContent);
        console.log(chalk.gray(`  Generated ${viewPath}`));
      }
    }
  }
}

async function generateLayout() {
  const template = await fs.readFile(path.join(__dirname, 'templates', 'Layout.hbs'), 'utf8');
  const compile = Handlebars.compile(template);
  
  const content = compile({ 
    pages: appDescription.pages,
    projectName: appDescription.projectName 
  });
  const outputPath = path.join('AspPrep', 'Views', 'Shared', '_Layout.cshtml');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content);
  console.log(chalk.gray(`  Generated ${outputPath}`));
}

async function generateSeedUsers() {
  if (!appDescription.seedUsers) return;
  const outputPath = path.join('AspPrep', 'seedUsers.json');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, appDescription.seedUsers, { spaces: 2 });
  console.log(chalk.gray(`  Generated ${outputPath}`));
}

// Register Handlebars helpers
Handlebars.registerHelper('csharpType', (type: string) => {
  switch (type) {
    case 'string': return 'string';
    case 'int': return 'int';
    case 'float': return 'float';
    case 'DateTime': return 'DateTime';
    case 'Date': return 'DateOnly';
    case 'boolean': return 'bool';
    case 'enum': return 'string';
    default: return 'object';
  }
});

Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

Handlebars.registerHelper('capitalize', (str: string) => str.charAt(0).toUpperCase() + str.slice(1));

Handlebars.registerHelper('searchInputType', (type: string) => {
  switch (type) {
    case 'int':
    case 'float':
      return 'number';
    case 'Date':
      return 'date';
    case 'DateTime':
      return 'datetime-local';
    default:
      return 'text';
  }
});

Handlebars.registerHelper('clientValidation', (property: any) => {
  const attrs: string[] = [];
  // Skip required attribute for boolean fields to avoid forcing check
  if (property.required && property.type !== 'boolean') attrs.push('required');
  if (property.minLength) attrs.push(`minlength="${property.minLength}"`);
  if (property.maxLength) attrs.push(`maxlength="${property.maxLength}"`);
  if (property.min !== undefined) attrs.push(`min="${property.min}"`);
  if (property.max !== undefined) attrs.push(`max="${property.max}"`);
  if (property.regex) attrs.push(`pattern="${property.regex}"`);
  return attrs.join(' ');
});

Handlebars.registerHelper('isForeignKey', (propName: string, entity: any) => {
  if (!entity.relations) return false;
  return entity.relations.some((r: any) => propName === `${r.navigationProperty}Id`);
});

validateSchema();
program.parse();
