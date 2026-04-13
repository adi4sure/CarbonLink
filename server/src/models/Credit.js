import { createCollection } from '../config/jsonDb.js';

const creditDb = createCollection('credits');
const transactionDb = createCollection('transactions');
const listingDb = createCollection('listings');

export const Credit = {
  find: (filter) => creditDb.find(filter),
  findOne: (filter) => creditDb.findOne(filter),
  findById: (id) => creditDb.findById(id),
  create: (doc) => creditDb.create(doc),
  findByIdAndUpdate: (id, update, opts) => creditDb.findByIdAndUpdate(id, update, opts),
  updateMany: (filter, update) => creditDb.updateMany(filter, update),
  deleteMany: (filter) => creditDb.deleteMany(filter),
  countDocuments: (filter) => creditDb.countDocuments(filter),
  aggregate: (pipeline) => creditDb.aggregate(pipeline),
};

export const Transaction = {
  find: (filter) => transactionDb.find(filter),
  findOne: (filter) => transactionDb.findOne(filter),
  findById: (id) => transactionDb.findById(id),
  create: (doc) => transactionDb.create(doc),
  findByIdAndUpdate: (id, update, opts) => transactionDb.findByIdAndUpdate(id, update, opts),
  deleteMany: (filter) => transactionDb.deleteMany(filter),
  countDocuments: (filter) => transactionDb.countDocuments(filter),
};

export const Listing = {
  find: (filter) => listingDb.find(filter),
  findOne: (filter) => listingDb.findOne(filter),
  findById: (id) => listingDb.findById(id),
  create: (doc) => listingDb.create(doc),
  findByIdAndUpdate: (id, update, opts) => listingDb.findByIdAndUpdate(id, update, opts),
  deleteMany: (filter) => listingDb.deleteMany(filter),
  countDocuments: (filter) => listingDb.countDocuments(filter),
};
