import { Kysely, Generated, Insertable, Selectable, Updateable } from 'kysely';

// Database types - customize for your schema
export interface Database {
  users: UsersTable;
  products: ProductsTable;
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  metadata: JSON;
  created_at: Generated<Date>;
  updated_at: Date;
}

export interface ProductsTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  category: string;
  inventory: number;
  tags: string[];
  created_at: Generated<Date>;
  updated_at: Date;
}

// Type aliases
export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type Product = Selectable<ProductsTable>;
export type NewProduct = Insertable<ProductsTable>;
export type ProductUpdate = Updateable<ProductsTable>;

// Generic Repository
export class CrudRepository<T extends keyof Database, Table extends Database[T]> {
  constructor(
    private db: Kysely<Database>,
    private tableName: T
  ) {}

  async findById(id: string): Promise<Selectable<Table> | null> {
    const result = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return result || null;
  }

  async findAll(filters?: Record<string, unknown>): Promise<Selectable<Table>[]> {
    let query = this.db.selectFrom(this.tableName).selectAll();

    if (filters) {
      if (filters.search) {
        // Add text search - customize per table
        // query = query.where('name', 'ilike', `%${filters.search}%`);
      }
      if (filters.limit) {
        query = query.limit(Number(filters.limit));
      }
      if (filters.offset) {
        query = query.offset(Number(filters.offset));
      }
    }

    return query.execute();
  }

  async create(data: Insertable<Table>): Promise<Selectable<Table>> {
    const result = await this.db
      .insertInto(this.tableName)
      .values(data as Insertable<Table>)
      .returningAll()
      .executeTakeFirst();
    return result;
  }

  async update(id: string, data: Updateable<Table>): Promise<Selectable<Table> | null> {
    const result = await this.db
      .updateTable(this.tableName)
      .set({ ...data, updated_at: new Date() } as Updateable<Table>)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteTable(this.tableName)
      .where('id', '=', id)
      .execute();
    return result.numDeletedRows > 0;
  }

  async count(): Promise<number> {
    const result = await this.db
      .selectFrom(this.tableName)
      .select<any>(fn => fn.countAll<number>().as('count'))
      .executeTakeFirst();
    return Number(result?.count || 0);
  }
}

// User-specific repository
export class UserRepository extends CrudRepository<'users', UsersTable> {
  constructor(db: Kysely<Database>) {
    super(db, 'users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst() as Promise<User | null>;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('role', '=', role)
      .execute() as Promise<User[]>;
  }
}

// Product-specific repository
export class ProductRepository extends CrudRepository<'products', ProductsTable> {
  constructor(db: Kysely<Database>) {
    super(db, 'products');
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.db
      .selectFrom('products')
      .selectAll()
      .where('sku', '=', sku)
      .executeTakeFirst() as Promise<Product | null>;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.db
      .selectFrom('products')
      .selectAll()
      .where('category', '=', category)
      .execute() as Promise<Product[]>;
  }

  async decrementInventory(id: string, quantity: number): Promise<Product | null> {
    return this.db
      .updateTable('products')
      .set(db => ({
        inventory: db('inventory', '-', quantity),
        updated_at: new Date(),
      }))
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst() as Promise<Product | null>;
  }
}
