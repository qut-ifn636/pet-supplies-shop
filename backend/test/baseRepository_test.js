const { expect } = require('chai');
const sinon = require('sinon');
const BaseRepository = require('../repositories/BaseRepository');

describe('BaseRepository', () => {
    let fakeModel;
    let repo;

    beforeEach(() => {
        fakeModel = {
            findById: sinon.stub(),
            create: sinon.stub(),
            findByIdAndDelete: sinon.stub(),
        };
        repo = new BaseRepository(fakeModel);
    });

    afterEach(() => sinon.restore());

    describe('findById', () => {
        it('delegates to model.findById and returns the result', async () => {
            const fakeDoc = { _id: 'abc123', name: 'Fido' };
            fakeModel.findById.resolves(fakeDoc);

            const result = await repo.findById('abc123');

            expect(fakeModel.findById.calledOnceWith('abc123')).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });

    describe('create', () => {
        it('delegates to model.create and returns the new document', async () => {
            const data = { name: 'Fido' };
            const fakeDoc = { _id: 'abc123', ...data };
            fakeModel.create.resolves(fakeDoc);

            const result = await repo.create(data);

            expect(fakeModel.create.calledOnceWith(data)).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });

    describe('save', () => {
        it('calls doc.save() and returns the result', async () => {
            const fakeDoc = { _id: 'abc123', save: sinon.stub().resolves({ _id: 'abc123' }) };

            const result = await repo.save(fakeDoc);

            expect(fakeDoc.save.calledOnce).to.be.true;
            expect(result._id).to.equal('abc123');
        });
    });

    describe('deleteById', () => {
        it('delegates to model.findByIdAndDelete and returns the deleted document', async () => {
            const fakeDoc = { _id: 'abc123' };
            fakeModel.findByIdAndDelete.resolves(fakeDoc);

            const result = await repo.deleteById('abc123');

            expect(fakeModel.findByIdAndDelete.calledOnceWith('abc123')).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });
});
