// db/generate-sql.js
const fs = require('fs');
const path = require('path');

// Función para convertir el tipo de dato de Joi a SQL
function getSqlType(joiType) {
  switch (joiType.type) {
    case 'string':
      if (joiType._flags && joiType._flags.format === 'uuid') {
        return 'UUID';
      }
      if (joiType._flags && joiType._flags.pattern) {
        return 'VARCHAR(255)';
      }
      return 'VARCHAR(255)';
    case 'number':
      return 'INT';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'DATETIME';
    default:
      return 'TEXT';
  }
}

// Función para generar la definición de una columna SQL
function generateColumnDefinition(columnName, joiType) {
  const sqlType = getSqlType(joiType);
  let definition = `${columnName} ${sqlType}`;

  if (joiType._flags && joiType._flags.presence === 'required') {
    definition += ' NOT NULL';
  }

  if (joiType._flags && joiType._flags.format === 'uuid') {
    definition += ' PRIMARY KEY';
  }

  return definition;
}

// Función para generar la sentencia CREATE TABLE
function generateCreateTableStatement(schemaName, joiSchema) {
  const columnDefinitions = [];

  for (const key in joiSchema) {
    const joiType = joiSchema[key];
    if (joiType.type) {
      columnDefinitions.push(generateColumnDefinition(key, joiType));
    }
  }

  const createTableStatement = `CREATE TABLE IF NOT EXISTS ${schemaName} (\n  ${columnDefinitions.join(',\n  ')}\n);`;
  return createTableStatement;
}

// Función para generar el archivo SQL
function generateSqlFile() {
  try {
    const schemasDir = path.join(__dirname, '../schemas');
    const schemaFiles = fs.readdirSync(schemasDir).filter(file => file.endsWith('.schema.js'));
    const sqlStatements = ['USE neec_dev;'];

    for (const file of schemaFiles) {
      const schemaPath = path.join(schemasDir, file);
      const schemaModule = require(schemaPath);
      const schemaName = path.basename(file, '.schema.js');
      sqlStatements.push(generateCreateTableStatement(schemaName, schemaModule.schema));
    }

    const sqlContent = sqlStatements.join('\n\n');
    const sqlFilePath = path.join(__dirname, 'database.sql');
    fs.writeFileSync(sqlFilePath, sqlContent);
    console.log(`Archivo SQL generado correctamente en: ${sqlFilePath}`);
  } catch (error) {
    console.error('Error al generar el archivo SQL:', error);
  }
}

// Ejecutar la generación del archivo SQL
generateSqlFile();
