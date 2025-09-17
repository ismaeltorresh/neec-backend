const { sqlPaginate } = require('../utils/sqlPagination');
const db = require('../db/connection');
const boom = require('@hapi/boom');

jest.mock('../db/connection', () => ({
  sequelize: {
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' },
  },
}));

describe('sqlPaginate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('happy path: returns data and meta when COUNT and SELECT succeed', async () => {
    // Mock COUNT query result: sequelize.query for count returns [[{ total: 25 }]]
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 25 }]])
      // Mock data query result: [rows]
      .mockResolvedValueOnce([[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]]);

    const res = await sqlPaginate({
      table: 'people',
      recordStatus: true,
      page: 1,
      pageSize: 10,
      columns: '*',
      whereClause: 'recordStatus = :recordStatus',
      replacements: {},
    });

    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('meta');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.meta.total).toBe(25);
    expect(res.meta.page).toBe(1);
    expect(res.meta.pageSize).toBe(10);
    expect(res.meta.totalPages).toBe(Math.ceil(25 / 10));

    // ensure queries were called twice
    expect(db.sequelize.query).toHaveBeenCalledTimes(2);
    const firstCall = db.sequelize.query.mock.calls[0][0];
    expect(firstCall).toMatch(/SELECT COUNT\(\*\) as total FROM people WHERE/);
  });

  test('throws badRequest for invalid table name', async () => {
    await expect(sqlPaginate({ table: 'people; DROP TABLE users' })).rejects.toThrow();
    try {
      await sqlPaginate({ table: 'people; DROP TABLE users' });
    } catch (err) {
      expect(err.isBoom).toBe(true);
      expect(err.output.statusCode).toBe(400);
    }
  });

  test('throws badRequest when sortBy is not allowed', async () => {
    await expect(
      sqlPaginate({
        table: 'people',
        sortBy: 'password',
        allowedSorts: ['name', 'createdAt'],
      })
    ).rejects.toThrow();

    try {
      await sqlPaginate({ table: 'people', sortBy: 'password', allowedSorts: ['name', 'createdAt'] });
    } catch (err) {
      expect(err.isBoom).toBe(true);
      expect(err.output.statusCode).toBe(400);
    }
  });

  test('supports exact filters and wildcard filters (using *)', async () => {
    // For this test we expect the COUNT and SELECT to be called; we assert that replacements contain filter placeholders
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([[{ id: 1, name: 'Alice' }, { id: 2, name: 'Alicia' }]]);

    const res = await sqlPaginate({
      table: 'people',
      page: 1,
      pageSize: 10,
      filters: { nameOne: 'Alice', slug: 'alic*' },
      allowedFilters: ['nameOne', 'slug'],
    });

    expect(res.meta.total).toBe(2);
    // Ensure the mocked sequelize was called and that replacements included f_nameOne and f_slug
    const firstReplacements = db.sequelize.query.mock.calls[0][1].replacements;
    expect(firstReplacements).toHaveProperty('f_nameOne', 'Alice');
    // wildcard should be converted to % by the helper and used as LIKE
    expect(firstReplacements).toHaveProperty('f_slug');
    expect(firstReplacements.f_slug).toMatch(/alic/);
  });

  test('normalizes recordStatus values ("1","0","true","false")', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, name: 'Test' }]]);

    // Pass recordStatus as string '1'
    const res1 = await sqlPaginate({ table: 'people', recordStatus: '1' });
    expect(res1.meta.total).toBe(1);

    // Pass recordStatus as string 'false'
    db.sequelize.query.mockResolvedValueOnce([[{ total: 0 }]]).mockResolvedValueOnce([[]]);
    const res2 = await sqlPaginate({ table: 'people', recordStatus: 'false' });
    expect(res2.meta.total).toBe(0);
  });

  test('search q across multiple columns builds LIKE clauses', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 3 }]])
      .mockResolvedValueOnce([[{ id: 1 }, { id: 2 }, { id: 3 }]]);

    const res = await sqlPaginate({
      table: 'people',
      search: { q: 'Ali', columns: ['nameOne', 'slug'] },
      page: 1,
      pageSize: 10,
    });

    expect(res.meta.total).toBe(3);
    const firstReplacements = db.sequelize.query.mock.calls[0][1].replacements;
    expect(firstReplacements).toHaveProperty('q_search', '%Ali%');
  });

  test('uses allowed sortBy to build ORDER BY clause', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await sqlPaginate({
      table: 'people',
      page: 1,
      pageSize: 10,
      sortBy: 'nameOne',
      sortDir: 'ASC',
      allowedSorts: ['nameOne', 'createdAt'],
      columns: '*',
    });

    // dataQuery is the second sequelize.query call first argument
    const dataQuery = db.sequelize.query.mock.calls[1][0];
    expect(dataQuery).toMatch(/ORDER BY nameOne ASC/);
  });

  test('falls back to raw orderBy when sortBy is not provided', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 0 }]])
      .mockResolvedValueOnce([[]]);

    await sqlPaginate({
      table: 'people',
      page: 1,
      pageSize: 10,
      orderBy: 'updatedAt DESC',
      columns: '*',
    });

    const dataQuery = db.sequelize.query.mock.calls[1][0];
    expect(dataQuery).toMatch(/ORDER BY updatedAt DESC/);
  });

  test('ignores filters that are not in allowedFilters and includes allowed ones only', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 42 }]]);

    await sqlPaginate({
      table: 'people',
      page: 1,
      pageSize: 10,
      filters: { badcol: 'x', nameOne: 'Bob' },
      allowedFilters: ['nameOne'],
    });

    const countQuery = db.sequelize.query.mock.calls[0][0];
    // badcol should not appear in the built WHERE
    expect(countQuery).not.toMatch(/badcol/);
    const replacements = db.sequelize.query.mock.calls[0][1].replacements;
    expect(replacements).toHaveProperty('f_nameOne', 'Bob');
    expect(replacements).not.toHaveProperty('f_badcol');
  });

  test('sets correct limit and offset based on page and pageSize', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 100 }]])
      .mockResolvedValueOnce([[]]);

    await sqlPaginate({ table: 'people', page: 3, pageSize: 5 });
    const replacements = db.sequelize.query.mock.calls[0][1].replacements;
    expect(replacements.limit).toBe(5);
    expect(replacements.offset).toBe(10); // (3-1)*5 = 10
  });

  test('propagates error when COUNT query fails', async () => {
    db.sequelize.query.mockRejectedValueOnce(new Error('DB COUNT failed'));
    await expect(sqlPaginate({ table: 'people' })).rejects.toThrow('DB COUNT failed');
  });

  test('propagates error when SELECT query fails', async () => {
    db.sequelize.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockRejectedValueOnce(new Error('DB SELECT failed'));

    await expect(sqlPaginate({ table: 'people' })).rejects.toThrow('DB SELECT failed');
  });
});
