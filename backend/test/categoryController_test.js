const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const categoryRepository = require('../repositories/CategoryRepository');
const productRepository = require('../repositories/ProductRepository');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

// Helper: grab the payload passed to res.json on the first call
const payloadOf = (res) => res.json.getCall(0).args[0];

describe('Category Controller', () => {
    afterEach(() => sinon.restore());

    // ---------- getCategories ----------
    describe('getCategories', () => {
        it('returns all categories with a 200', async () => {
            const categories = [{ name: 'Dogs' }, { name: 'Cats' }];
            sinon.stub(categoryRepository, 'findAll').resolves(categories);

            const req = {};
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getCategories(req, res);

            expect(categoryRepository.findAll.calledOnce).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(categories);
        });
    });

    // ---------- getCategory ----------
    describe('getCategory', () => {
        it('returns a category when found', async () => {
            const category = { _id: 'cat1', name: 'Dogs' };
            sinon.stub(categoryRepository, 'findById').resolves(category);

            const req = { params: { id: 'cat1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getCategory(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(category);
        });

        it('returns 404 when the category does not exist', async () => {
            sinon.stub(categoryRepository, 'findById').resolves(null);

            const req = { params: { id: 'missing' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getCategory(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', false);
            expect(payload).to.have.property('message', 'Category not found');
        });
    });

    // ---------- createCategory ----------
    describe('createCategory', () => {
        it('creates a category and returns 201', async () => {
            const created = { _id: 'cat1', name: 'Birds' };
            sinon.stub(categoryRepository, 'create').resolves(created);

            const req = { body: { name: 'Birds' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createCategory(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(created);
        });

        it('returns 400 when the name is missing', async () => {
            const req = { body: {} };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createCategory(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(payloadOf(res)).to.have.property('success', false);
        });

        it('returns 409 when the category name already exists', async () => {
            const dupErr = new Error('dup');
            dupErr.code = 11000;
            sinon.stub(categoryRepository, 'create').rejects(dupErr);

            const req = { body: { name: 'Dogs' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createCategory(req, res);

            expect(res.status.calledWith(409)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', false);
            expect(payload).to.have.property('message', 'A category with that name already exists');
        });
    });

    // ---------- updateCategory ----------
    describe('updateCategory', () => {
        it('updates a category and returns the result', async () => {
            const existing = { _id: 'cat1', name: 'Old' };
            const updated = { _id: 'cat1', name: 'New' };
            sinon.stub(categoryRepository, 'findById').resolves(existing);
            sinon.stub(categoryRepository, 'save').resolves(updated);

            const req = { params: { id: 'cat1' }, body: { name: 'New' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await updateCategory(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(updated);
        });

        it('returns 409 when the updated name collides with an existing one', async () => {
            const existing = { _id: 'cat1', name: 'Old' };
            const dupErr = new Error('dup');
            dupErr.code = 11000;
            sinon.stub(categoryRepository, 'findById').resolves(existing);
            sinon.stub(categoryRepository, 'save').rejects(dupErr);

            const req = { params: { id: 'cat1' }, body: { name: 'Cats' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await updateCategory(req, res);

            expect(res.status.calledWith(409)).to.be.true;
            expect(payloadOf(res)).to.have.property('message', 'A category with that name already exists');
        });
    });

    // ---------- deleteCategory ----------
    describe('deleteCategory', () => {
        it('deletes a category when no products reference it', async () => {
            sinon.stub(categoryRepository, 'findById').resolves({ _id: 'cat1' });
            sinon.stub(productRepository, 'countByCategory').resolves(0);
            sinon.stub(categoryRepository, 'deleteById').resolves();

            const req = { params: { id: 'cat1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await deleteCategory(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload).to.have.property('message', 'Category deleted successfully');
        });

        it('returns 400 when products still reference the category', async () => {
            sinon.stub(categoryRepository, 'findById').resolves({ _id: 'cat1' });
            sinon.stub(productRepository, 'countByCategory').resolves(3);
            sinon.stub(categoryRepository, 'deleteById').resolves();

            const req = { params: { id: 'cat1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await deleteCategory(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(payloadOf(res)).to.have.property('success', false);
        });
    });
});
