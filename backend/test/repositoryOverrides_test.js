const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const { ProductRepository } = require('../repositories/ProductRepository');
const { CategoryRepository } = require('../repositories/CategoryRepository');
const { UserRepository } = require('../repositories/UserRepository');

/**
 * These tests lock in the polymorphic behaviour of findAll(): every repository
 * extends BaseRepository and overrides findAll() with its own query, so calling
 * the same inherited interface dispatches to different behaviour per subtype.
 */
describe('Repository findAll() polymorphism', () => {
    afterEach(() => sinon.restore());

    it('ProductRepository.findAll populates category and sorts by createdAt', async () => {
        const docs = [{ _id: 'p1' }];
        const sortStub = sinon.stub().resolves(docs);
        const populateStub = sinon.stub().returns({ sort: sortStub });
        const model = { find: sinon.stub().returns({ populate: populateStub }) };
        const repo = new ProductRepository(model);

        const result = await repo.findAll({ category: 'c1' });

        expect(model.find.calledOnceWith({ category: 'c1' })).to.be.true;
        expect(populateStub.calledOnceWith('category', 'name')).to.be.true;
        expect(sortStub.calledOnceWith({ createdAt: -1 })).to.be.true;
        expect(result).to.equal(docs);
    });

    it('CategoryRepository.findAll sorts by name', async () => {
        const cats = [{ _id: 'c1' }];
        const sortStub = sinon.stub().resolves(cats);
        const model = { find: sinon.stub().returns({ sort: sortStub }) };
        const repo = new CategoryRepository(model);

        const result = await repo.findAll();

        expect(model.find.calledOnce).to.be.true;
        expect(sortStub.calledOnceWith({ name: 1 })).to.be.true;
        expect(result).to.equal(cats);
    });

    it('UserRepository.findAll excludes the password field', async () => {
        const users = [{ _id: 'u1' }];
        const selectStub = sinon.stub().resolves(users);
        const model = { find: sinon.stub().returns({ select: selectStub }) };
        const repo = new UserRepository(model);

        const result = await repo.findAll();

        expect(model.find.calledOnce).to.be.true;
        expect(selectStub.calledOnceWith('-password')).to.be.true;
        expect(result).to.equal(users);
    });

    it('dispatches findAll polymorphically through the shared BaseRepository interface', async () => {
        const productModel = {
            find: sinon.stub().returns({ populate: sinon.stub().returns({ sort: sinon.stub().resolves(['p']) }) }),
        };
        const categoryModel = { find: sinon.stub().returns({ sort: sinon.stub().resolves(['c']) }) };
        const userModel = { find: sinon.stub().returns({ select: sinon.stub().resolves(['u']) }) };

        const repos = [
            new ProductRepository(productModel),
            new CategoryRepository(categoryModel),
            new UserRepository(userModel),
        ];

        // Same call, three different behaviours selected by the runtime type.
        const results = await Promise.all(repos.map((r) => r.findAll()));

        expect(results).to.deep.equal([['p'], ['c'], ['u']]);
        expect(productModel.find.calledOnce).to.be.true;
        expect(categoryModel.find.calledOnce).to.be.true;
        expect(userModel.find.calledOnce).to.be.true;
    });
});

describe('ProductRepository.countByCategory()', () => {
    afterEach(() => sinon.restore());

    it('reuses the inherited count() to count products in a category', async () => {
        const model = { countDocuments: sinon.stub().resolves(3) };
        const repo = new ProductRepository(model);

        const result = await repo.countByCategory('c1');

        expect(model.countDocuments.calledOnceWith({ category: 'c1' })).to.be.true;
        expect(result).to.equal(3);
    });
});
