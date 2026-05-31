const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const productRepository = require('../repositories/ProductRepository');
const categoryRepository = require('../repositories/CategoryRepository');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

// Helper: grab the payload passed to res.json on the first call
const payloadOf = (res) => res.json.getCall(0).args[0];

describe('Product Controller', () => {
    afterEach(() => sinon.restore());

    // ---------- getProducts ----------
    describe('getProducts', () => {
        it('returns all products with a 200 (no filter)', async () => {
            const products = [{ name: 'Dog Food' }, { name: 'Cat Toy' }];
            sinon.stub(productRepository, 'findAll').resolves(products);

            const req = { query: {} };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getProducts(req, res);

            expect(productRepository.findAll.calledOnce).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(products);
        });

        it('passes a regex search filter when ?search= is provided', async () => {
            sinon.stub(productRepository, 'findAll').resolves([]);

            const req = { query: { search: 'dog' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getProducts(req, res);

            const filterArg = productRepository.findAll.getCall(0).args[0];
            expect(filterArg.name).to.deep.equal({ $regex: 'dog', $options: 'i' });
        });

        it('returns a 500 envelope when the repository throws', async () => {
            sinon.stub(productRepository, 'findAll').rejects(new Error('db down'));

            const req = { query: {} };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getProducts(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', false);
            expect(payload).to.have.property('message', 'db down');
        });
    });

    // ---------- getProduct ----------
    describe('getProduct', () => {
        it('returns a product when found', async () => {
            const product = { _id: 'p1', name: 'Dog Food' };
            sinon.stub(productRepository, 'findByIdWithCategory').resolves(product);

            const req = { params: { id: 'p1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getProduct(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(product);
        });

        it('returns 404 when the product is missing', async () => {
            sinon.stub(productRepository, 'findByIdWithCategory').resolves(null);

            const req = { params: { id: 'missing' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await getProduct(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', false);
            expect(payload).to.have.property('message', 'Product not found');
        });
    });

    // ---------- createProduct ----------
    describe('createProduct', () => {
        it('creates a product and returns 201', async () => {
            const created = { _id: 'p1', name: 'Dog Food', price: 10 };
            sinon.stub(categoryRepository, 'findById').resolves({ _id: 'cat1' });
            sinon.stub(productRepository, 'create').resolves(created);
            sinon.stub(productRepository, 'populateCategory').resolves(created);

            const req = { body: { name: 'Dog Food', price: 10, category: 'cat1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createProduct(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(created);
        });

        it('returns 400 when required fields are missing', async () => {
            const req = { body: { name: 'Incomplete' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createProduct(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(payloadOf(res)).to.have.property('success', false);
        });

        it('returns 400 when the price is negative', async () => {
            const req = { body: { name: 'Dog Food', price: -5, category: 'cat1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createProduct(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(payloadOf(res)).to.have.property('message', 'Price cannot be negative');
        });

        it('returns 400 when the referenced category does not exist', async () => {
            sinon.stub(categoryRepository, 'findById').resolves(null);

            const req = { body: { name: 'Dog Food', price: 10, category: 'badcat' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await createProduct(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(payloadOf(res)).to.have.property('success', false);
        });
    });

    // ---------- updateProduct ----------
    describe('updateProduct', () => {
        it('updates a product and returns the populated result', async () => {
            const existing = { _id: 'p1', name: 'Old', category: { toString: () => 'cat1' } };
            const updated = { _id: 'p1', name: 'New' };
            sinon.stub(productRepository, 'findById').resolves(existing);
            sinon.stub(productRepository, 'save').resolves(updated);
            sinon.stub(productRepository, 'populateCategory').resolves(updated);

            const req = { params: { id: 'p1' }, body: { name: 'New' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await updateProduct(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload.data).to.deep.equal(updated);
        });

        it('returns 404 when the product to update is missing', async () => {
            sinon.stub(productRepository, 'findById').resolves(null);

            const req = { params: { id: 'missing' }, body: { name: 'New' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await updateProduct(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(payloadOf(res)).to.have.property('message', 'Product not found');
        });
    });

    // ---------- deleteProduct ----------
    describe('deleteProduct', () => {
        it('deletes a product and returns a success message', async () => {
            sinon.stub(productRepository, 'findById').resolves({ _id: 'p1' });
            sinon.stub(productRepository, 'deleteById').resolves();

            const req = { params: { id: 'p1' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await deleteProduct(req, res);

            const payload = payloadOf(res);
            expect(payload).to.have.property('success', true);
            expect(payload).to.have.property('message', 'Product deleted successfully');
        });

        it('returns 404 when the product to delete is missing', async () => {
            sinon.stub(productRepository, 'findById').resolves(null);

            const req = { params: { id: 'missing' } };
            const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

            await deleteProduct(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(payloadOf(res)).to.have.property('message', 'Product not found');
        });
    });
});
