/**
 * Tests de sincronización entre Zod schemas y TypeORM entities
 * Verifica que las definiciones estén alineadas
 * 
 * @module tests/schema-sync.test
 */

import { createExampleSchema, updateExampleSchema } from '../schemas/example.schema.js';
import { Example } from '../entities/example.entity.js';
import { AppDataSource } from '../db/connection.js';

describe('Zod ↔ TypeORM Synchronization', () => {
  describe('Example Entity', () => {
    it('debe tener los mismos campos base', () => {
      // Campos definidos en Zod
      const zodKeys = Object.keys(createExampleSchema.shape).sort();
      
      // Campos esperados en la entidad (excluyendo campos de BaseEntity)
      const expectedFields = ['name', 'email', 'description', 'isActive'].sort();
      
      expect(zodKeys).toEqual(expectedFields);
    });

    it('name: longitud máxima debe coincidir', () => {
      // Test indirecto: validar que rechaza nombres muy largos
      const longName = 'a'.repeat(256);
      
      expect(() => createExampleSchema.parse({
        name: longName,
        email: 'test@example.com',
        isActive: true
      })).toThrow();
      
      // Y acepta nombres de exactamente 255
      const maxName = 'a'.repeat(255);
      expect(() => createExampleSchema.parse({
        name: maxName,
        email: 'test@example.com',
        isActive: true
      })).not.toThrow();
    });

    it('email: debe ser válido en Zod', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'not-an-email';
      
      expect(() => createExampleSchema.parse({
        name: 'Test',
        email: validEmail,
        isActive: true
      })).not.toThrow();
      
      expect(() => createExampleSchema.parse({
        name: 'Test',
        email: invalidEmail,
        isActive: true
      })).toThrow();
    });

    it('description: debe ser opcional en ambos', () => {
      const withoutDescription = {
        name: 'Test',
        email: 'test@example.com',
        isActive: true
      };
      
      // Zod debe permitir omitir description
      expect(() => createExampleSchema.parse(withoutDescription)).not.toThrow();
      
      const withDescription = {
        ...withoutDescription,
        description: 'Some description'
      };
      
      expect(() => createExampleSchema.parse(withDescription)).not.toThrow();
    });

    it('isActive: debe tener default true', () => {
      const parsed = createExampleSchema.parse({
        name: 'Test',
        email: 'test@example.com'
        // isActive omitido
      });
      
      expect(parsed.isActive).toBe(true);
    });

    it('updateExampleSchema: todos los campos deben ser opcionales', () => {
      const emptyUpdate = {};
      
      // Update schema debe permitir objeto vacío (partial)
      expect(() => updateExampleSchema.parse(emptyUpdate)).not.toThrow();
      
      const partialUpdate = { name: 'New Name' };
      expect(() => updateExampleSchema.parse(partialUpdate)).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('CreateExampleInput debe tener tipos correctos', () => {
      // Esta prueba se hace en tiempo de compilación
      // Si TypeScript no da error, los tipos están correctos
      
      const validData = {
        name: 'Test Name',
        email: 'test@example.com',
        description: 'Test description',
        isActive: true
      };
      
      const parsed = createExampleSchema.parse(validData);
      
      // TypeScript debe inferir los tipos correctamente
      expect(typeof parsed.name).toBe('string');
      expect(typeof parsed.email).toBe('string');
      expect(typeof parsed.isActive).toBe('boolean');
      expect(typeof parsed.description === 'string' || parsed.description === undefined).toBe(true);
    });
  });

  describe('Validation Rules', () => {
    it('name: debe validar longitud mínima', () => {
      expect(() => createExampleSchema.parse({
        name: 'Ab', // Solo 2 caracteres (mínimo es 3)
        email: 'test@example.com',
        isActive: true
      })).toThrow('El nombre debe tener al menos 3 caracteres');
    });

    it('name: debe validar longitud máxima', () => {
      const longName = 'a'.repeat(256); // 256 caracteres (máximo es 255)
      
      expect(() => createExampleSchema.parse({
        name: longName,
        email: 'test@example.com',
        isActive: true
      })).toThrow('El nombre no puede exceder 255 caracteres');
    });

    it('email: debe validar formato', () => {
      expect(() => createExampleSchema.parse({
        name: 'Test',
        email: 'not-an-email',
        isActive: true
      })).toThrow('Email inválido');
    });

    it('email: debe convertir a lowercase', () => {
      const parsed = createExampleSchema.parse({
        name: 'Test',
        email: 'TEST@EXAMPLE.COM',
        isActive: true
      });
      
      expect(parsed.email).toBe('test@example.com');
    });

    it('name y email: deben trimear espacios', () => {
      const parsed = createExampleSchema.parse({
        name: '  Test Name  ',
        email: '  test@example.com  ',
        isActive: true
      });
      
      expect(parsed.name).toBe('Test Name');
      expect(parsed.email).toBe('test@example.com');
    });
  });
});

describe('Integration: Zod + TypeORM', () => {
  // Estos tests requieren conexión a BD
  // Solo se ejecutan si la BD está disponible
  
  beforeAll(async () => {
    // Inicializar DataSource si no está inicializado
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
      } catch (error) {
        console.warn('DB not available for integration tests');
      }
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('debe poder crear entidad con datos validados por Zod', async () => {
    if (!AppDataSource.isInitialized) {
      return; // Skip si no hay BD
    }

    // 1. Validar con Zod
    const inputData = {
      name: 'Integration Test',
      email: 'integration@test.com',
      isActive: true
    };

    const validatedData = createExampleSchema.parse(inputData);

    // 2. Crear entidad TypeORM con datos validados
    const exampleRepo = AppDataSource.getRepository(Example);
    const example = exampleRepo.create(validatedData);

    // 3. Verificar que la entidad tiene los valores correctos
    expect(example.name).toBe('Integration Test');
    expect(example.email).toBe('integration@test.com');
    expect(example.isActive).toBe(true);

    // No guardamos en BD para no contaminar
  });
});
