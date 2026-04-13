import bcrypt from 'bcryptjs';
import { createCollection } from '../config/jsonDb.js';

const db = createCollection('users');

// Thin wrapper that mimics Mongoose Model API
const User = {
  async findOne(filter) {
    const doc = await db.findOne(filter);
    return doc ? addMethods(doc) : null;
  },

  findById(id) {
    return {
      select(fields) {
        return {
          async then(resolve, reject) {
            try {
              const doc = await db.findById(id);
              resolve(doc ? addMethods(doc) : null);
            } catch (e) { reject(e); }
          }
        };
      },
      async then(resolve, reject) {
        try {
          const doc = await db.findById(id);
          resolve(doc ? addMethods(doc) : null);
        } catch (e) { reject(e); }
      }
    };
  },

  async create(docOrDocs) {
    const isArray = Array.isArray(docOrDocs);
    const docs = isArray ? docOrDocs : [docOrDocs];

    const results = [];
    for (const doc of docs) {
      // Hash password before saving
      if (doc.password) {
        doc.password = await bcrypt.hash(doc.password, 12);
      }
      const created = await db.create(doc);
      results.push(addMethods(created));
    }
    return isArray ? results : results[0];
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const doc = await db.findByIdAndUpdate(id, update, options);
    return doc ? addMethods(doc) : null;
  },

  async findOne_withPassword(filter) {
    // JSON DB doesn't hide fields, password is always present
    const doc = await db.findOne(filter);
    return doc ? addMethods(doc) : null;
  },

  async deleteMany(filter = {}) {
    return db.deleteMany(filter);
  },

  async countDocuments(filter = {}) {
    return db.countDocuments(filter);
  },

  find(filter = {}) {
    return db.find(filter);
  },
};

function addMethods(doc) {
  if (!doc) return null;

  // comparePassword
  doc.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  // isModified stub (always false after load)
  doc.isModified = function() { return false; };

  return doc;
}

export default User;
