/**
 * [ES] Datos de prueba para testing
 * [EN] Test data for testing
 * 
 * @module test/fakedata
 */

/**
 * [ES] Interfaz base para entidades
 * [EN] Base interface for entities
 */
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  recordStatus: boolean;
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
}

/**
 * [ES] Interfaz para direcciones
 * [EN] Interface for addresses
 */
interface Address extends BaseEntity {
  updatedBy: string;
  useAs: 'billing' | 'shipping' | 'office' | 'home';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  slug: string;
}

/**
 * [ES] Interfaz para personas
 * [EN] Interface for people
 */
interface Person extends BaseEntity {
  updatedBy: string;
  name: string;
  email: string;
  age: number;
  phone?: string;
  slug: string;
}

/**
 * [ES] Interfaz para productos
 * [EN] Interface for products
 */
interface Product extends BaseEntity {
  updatedBy: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  slug: string;
  isActive: boolean;
}

/**
 * [ES] Interfaz para usuarios
 * [EN] Interface for users
 */
interface User extends BaseEntity {
  updatedBy: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
  slug: string;
}

/**
 * [ES] Interfaz para templates
 * [EN] Interface for templates
 */
interface Template extends BaseEntity {
  updatedBy: string;
  name: string;
  description: string;
  content: string;
  type: string;
  isActive: boolean;
  slug: string;
}

/**
 * [ES] Estructura de datos de prueba
 * [EN] Test data structure
 */
interface FakeData {
  address: Address[];
  people: Person[];
  products: Product[];
  users: User[];
  template: Template[];
}

/**
 * [ES] Datos de prueba exportados
 * [EN] Exported test data
 */
const fakeData: FakeData = {
  address: [
    {
      id: "b7a1c5f2-1a6b-4c3d-9f2a-0e1f2a3b4c5d",
      createdAt: "2025-09-07T08:12:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-09-07T09:00:00.000Z",
      updatedBy: "d1a2b3c4-5e6f-7a8b-9c0d-e1f2a3b4c5d6",
      useAs: "billing",
      street: "Calle Falsa 123",
      city: "Madrid",
      state: "Comunidad de Madrid",
      zip: "28013",
      country: "ES",
      slug: "calle-falsa-123-madrid"
    },
    {
      id: "c8b2d6e3-2b7c-5d4e-0f3b-1a2e3c4d5f6a",
      createdAt: "2025-08-20T14:30:00.000Z",
      dataSource: "nosql",
      recordStatus: true,
      updatedAt: "2025-08-21T10:00:00.000Z",
      updatedBy: "f2b3c4d5-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
      useAs: "shipping",
      street: "Avenida Siempreviva 742",
      city: "Barcelona",
      state: "Cataluña",
      zip: "08002",
      country: "ES",
      slug: "avenida-siempreviva-742-barcelona"
    },
    {
      id: "d9c3e7f4-3c8d-6e5f-1g4c-2b3f4d5e6a7b",
      createdAt: "2025-07-11T09:45:00.000Z",
      dataSource: "both",
      recordStatus: false,
      updatedAt: "2025-07-15T12:00:00.000Z",
      updatedBy: "a3c4d5e6-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      useAs: "office",
      street: "Plaza Mayor, 1",
      city: "Sevilla",
      state: "Andalucía",
      zip: "41001",
      country: "ES",
      slug: "plaza-mayor-1-sevilla"
    }
  ],
  people: [
    {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      createdAt: "2025-01-15T10:30:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-01-20T14:45:00.000Z",
      updatedBy: "admin-user-001",
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      age: 30,
      phone: "+34 600 123 456",
      slug: "juan-perez"
    },
    {
      id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      createdAt: "2025-02-10T09:15:00.000Z",
      dataSource: "nosql",
      recordStatus: true,
      updatedAt: "2025-02-12T11:30:00.000Z",
      updatedBy: "admin-user-002",
      name: "María García",
      email: "maria.garcia@example.com",
      age: 28,
      slug: "maria-garcia"
    }
  ],
  products: [
    {
      id: "p1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      createdAt: "2025-03-01T08:00:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-03-05T10:30:00.000Z",
      updatedBy: "product-manager-001",
      name: "Laptop Pro 15",
      description: "Laptop profesional de alta gama",
      price: 1299.99,
      stock: 50,
      category: "electronics",
      slug: "laptop-pro-15",
      isActive: true
    },
    {
      id: "p2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
      createdAt: "2025-03-10T09:30:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-03-12T14:00:00.000Z",
      updatedBy: "product-manager-002",
      name: "Teclado Mecánico RGB",
      description: "Teclado mecánico con iluminación RGB",
      price: 149.99,
      stock: 100,
      category: "accessories",
      slug: "teclado-mecanico-rgb",
      isActive: true
    }
  ],
  users: [
    {
      id: "u1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      createdAt: "2025-01-01T00:00:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-01-10T12:00:00.000Z",
      updatedBy: "system",
      username: "admin",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
      slug: "admin"
    },
    {
      id: "u2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
      createdAt: "2025-01-05T10:00:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-01-15T14:30:00.000Z",
      updatedBy: "admin",
      username: "jdoe",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
      isActive: true,
      slug: "jdoe"
    }
  ],
  template: [
    {
      id: "t1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      createdAt: "2025-02-01T08:00:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-02-05T10:00:00.000Z",
      updatedBy: "template-admin-001",
      name: "Plantilla de Bienvenida",
      description: "Plantilla para emails de bienvenida",
      content: "<h1>Bienvenido</h1><p>Gracias por registrarte.</p>",
      type: "email",
      isActive: true,
      slug: "plantilla-bienvenida"
    },
    {
      id: "t2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
      createdAt: "2025-02-10T09:00:00.000Z",
      dataSource: "sql",
      recordStatus: true,
      updatedAt: "2025-02-12T11:00:00.000Z",
      updatedBy: "template-admin-002",
      name: "Plantilla de Confirmación",
      description: "Plantilla para emails de confirmación",
      content: "<h1>Confirmación</h1><p>Tu pedido ha sido confirmado.</p>",
      type: "email",
      isActive: true,
      slug: "plantilla-confirmacion"
    }
  ]
};

export default fakeData;
export type { 
  FakeData, 
  Address, 
  Person, 
  Product, 
  User, 
  Template, 
  BaseEntity 
};
