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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  .command('all')
  .description('Generate all code')
  .action(async () => {
    console.log(chalk.blue('Generating all code...'));
    await generateModels();
    await generateDbContext();
    await generateControllers();
    await generateLayout();
    console.log(chalk.green('✓ All code generated'));
  });

async function generateModels() {
  const template = await fs.readFile(path.join(__dirname, 'templates', 'Model.hbs'), 'utf8');
  const compile = Handlebars.compile(template);
  
  for (const entity of appDescription.entities) {
    const properties = [appDescription.defaults.id, ...entity.properties];
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
  
  const content = compile({ 
    entities: appDescription.entities,
    namespace: 'AspPrep.Data'
  });
  
  const outputPath = path.join('AspPrep', 'Data', 'ApplicationDbContext.cs');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content);
  console.log(chalk.gray(`  Generated ${outputPath}`));
}

async function generateControllers() {
  const controllerTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Controller.hbs'), 'utf8');
  const indexTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Index.hbs'), 'utf8');
  const createTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Create.hbs'), 'utf8');
  const editTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Edit.hbs'), 'utf8');
  const deleteTemplate = await fs.readFile(path.join(__dirname, 'templates', 'Delete.hbs'), 'utf8');
  
  const compileController = Handlebars.compile(controllerTemplate);
  const compileIndex = Handlebars.compile(indexTemplate);
  const compileCreate = Handlebars.compile(createTemplate);
  const compileEdit = Handlebars.compile(editTemplate);
  const compileDelete = Handlebars.compile(deleteTemplate);
  
  for (const entity of appDescription.entities) {
    const pageConfig = appDescription.pages.find(p => p.entity === entity.name);
    if (!pageConfig) continue;
    
    // Generate controller
    const controllerContent = compileController({ entity, pageConfig });
    const controllerPath = path.join('AspPrep', 'Controllers', `${entity.name}Controller.cs`);
    await fs.ensureDir(path.dirname(controllerPath));
    await fs.writeFile(controllerPath, controllerContent);
    console.log(chalk.gray(`  Generated ${controllerPath}`));
    
    // Generate views
    const viewsDir = path.join('AspPrep', 'Views', entity.name);
    await fs.ensureDir(viewsDir);
    
    for (const operation of pageConfig.operations) {
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
      }
      
      if (template) {
        const viewContent = template({ entity, operation, pageConfig });
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

// Register Handlebars helpers
Handlebars.registerHelper('csharpType', (type: string) => {
  switch (type) {
    case 'string': return 'string';
    case 'int': return 'int';
    case 'float': return 'float';
    case 'DateTime': return 'DateTime';
    case 'boolean': return 'bool';
    case 'enum': return 'string';
    default: return 'object';
  }
});

Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

Handlebars.registerHelper('capitalize', (str: string) => str.charAt(0).toUpperCase() + str.slice(1));

Handlebars.registerHelper('clientValidation', (property: any) => {
  const attrs: string[] = [];
  // Skip required attribute for boolean fields to avoid forcing check
  if (property.required && property.type !== 'boolean') attrs.push('required');
  if (property.minLength) attrs.push(`minlength="${property.minLength}"`);
  if (property.maxLength) attrs.push(`maxlength="${property.maxLength}"`);
  if (property.min !== undefined) attrs.push(`min="${property.min}"`);
  if (property.max !== undefined) attrs.push(`max="${property.max}"`);
  return attrs.join(' ');
});

program.parse();
