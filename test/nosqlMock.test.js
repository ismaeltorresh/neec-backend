const nosqlMock = require('../utils/nosqlMock');
const fake = require('./fakedata.json');

describe('nosqlMock helper', () => {
  test('list returns array for known service', () => {
    const people = nosqlMock.list('people');
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBe(fake.people.length);
  });

  test('paginateList returns {data, meta} and respects pageSize', () => {
    const total = fake.people.length;
    const pageSize = 2;
    const page = 1;
    const res = nosqlMock.paginateList('people', page, pageSize);
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('meta');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(pageSize);
    expect(res.meta.total).toBe(total);
    expect(res.meta.page).toBe(page);
    expect(res.meta.pageSize).toBe(pageSize);
    const expectedTotalPages = Math.max(1, Math.ceil(total / pageSize));
    expect(res.meta.totalPages).toBe(expectedTotalPages);
  });

  test('findById returns correct object or null', () => {
    const sample = fake.people[1];
    const found = nosqlMock.findById('people', sample.id);
    expect(found).toBeTruthy();
    expect(found.id).toBe(sample.id);

    const notFound = nosqlMock.findById('people', 'non-existent-id');
    expect(notFound).toBeNull();
  });

  test('works for another service (template)', () => {
    const list = nosqlMock.list('template');
    expect(Array.isArray(list)).toBe(true);
    const pag = nosqlMock.paginateList('template', 1, 3);
    expect(pag).toHaveProperty('data');
    expect(pag).toHaveProperty('meta');
  });

  test('filters work (exact match)', () => {
    // Filter people by useAs = 'supplier' (one record in fakedata)
    const res = nosqlMock.paginateList('people', 1, 10, { useAs: 'supplier' });
    expect(res.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.data.every(item => item.useAs === 'supplier')).toBe(true);
  });

  test('wildcard filters work with * and %', () => {
    // search for nameOne that contains 'Mar' with wildcard
    const res1 = nosqlMock.paginateList('people', 1, 10, { nameOne: '*Mar*' });
    expect(res1.meta.total).toBeGreaterThanOrEqual(1);
    expect(res1.data.some(i => i.nameOne && i.nameOne.toLowerCase().includes('mar'))).toBe(true);
    const res2 = nosqlMock.paginateList('people', 1, 10, { nameOne: '%Mar%' });
    expect(res2.meta.total).toBe(res1.meta.total);
  });

  test('search across multiple columns works', () => {
    const search = { q: 'madrid', columns: ['city', 'slug'] };
    const res = nosqlMock.paginateList('address', 1, 10, {}, search);
    // Should find at least the Madrid address from fakedata
    expect(res.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.data.some(i => (i.city && i.city.toLowerCase().includes('madrid')) || (i.slug && i.slug.includes('madrid')))).toBe(true);
  });
});
