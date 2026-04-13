import { createCollection } from '../config/jsonDb.js';

const db = createCollection('eco-actions');

const EcoAction = {
  find: (filter) => db.find(filter),
  findOne: (filter) => db.findOne(filter),
  findById: (id) => db.findById(id),
  create: (doc) => db.create(doc),
  findByIdAndUpdate: (id, update, opts) => db.findByIdAndUpdate(id, update, opts),
  deleteMany: (filter) => db.deleteMany(filter),
  countDocuments: (filter) => db.countDocuments(filter),
};

export default EcoAction;
