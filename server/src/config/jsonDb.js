import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Lightweight JSON file database — Mongoose-compatible API
 * Each collection is a single JSON file in server/data/
 */
class JsonDB {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8');
    }
  }

  _read() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Check if a document matches a filter
   */
  _matches(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, value] of Object.entries(filter)) {
      // $or operator
      if (key === '$or') {
        const orMatch = value.some(subFilter => this._matches(doc, subFilter));
        if (!orMatch) return false;
        continue;
      }

      const docVal = this._getNestedValue(doc, key);

      // Object operators ($gte, $lte, $in, $ne, etc.)
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        for (const [op, opVal] of Object.entries(value)) {
          if (op === '$gte' && !(docVal >= opVal)) return false;
          if (op === '$lte' && !(docVal <= opVal)) return false;
          if (op === '$gt' && !(docVal > opVal)) return false;
          if (op === '$lt' && !(docVal < opVal)) return false;
          if (op === '$ne' && docVal === opVal) return false;
          if (op === '$in' && !opVal.includes(docVal)) return false;
        }
        continue;
      }

      // Direct equality
      if (String(docVal) !== String(value)) return false;
    }
    return true;
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Find documents matching filter
   */
  find(filter = {}) {
    const data = this._read();
    let results = data.filter(doc => this._matches(doc, filter));
    
    // Return a chainable query object
    return new Query(results);
  }

  /**
   * Find one document
   */
  findOne(filter = {}) {
    const data = this._read();
    const doc = data.find(d => this._matches(d, filter));
    return new SingleQuery(doc, this, filter);
  }

  /**
   * Find by ID
   */
  findById(id) {
    return this.findOne({ _id: String(id) });
  }

  /**
   * Create one or more documents
   */
  async create(docOrDocs) {
    const data = this._read();
    const isArray = Array.isArray(docOrDocs);
    const docs = isArray ? docOrDocs : [docOrDocs];

    const created = docs.map(doc => {
      const newDoc = {
        _id: doc._id || uuidv4(),
        ...doc,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: doc.updatedAt || new Date().toISOString(),
      };
      data.push(newDoc);
      return this._wrapDoc(newDoc);
    });

    this._write(data);
    return isArray ? created : created[0];
  }

  /**
   * Find by ID and update
   */
  async findByIdAndUpdate(id, update, options = {}) {
    const data = this._read();
    const index = data.findIndex(d => String(d._id) === String(id));
    if (index === -1) return null;

    // Apply $inc
    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        const current = this._getNestedValue(data[index], key) || 0;
        this._setNestedValue(data[index], key, current + val);
      }
    }

    // Apply $set
    if (update.$set) {
      for (const [key, val] of Object.entries(update.$set)) {
        this._setNestedValue(data[index], key, val);
      }
    }

    // Direct field updates (non-operator)
    for (const [key, val] of Object.entries(update)) {
      if (!key.startsWith('$')) {
        data[index][key] = val;
      }
    }

    data[index].updatedAt = new Date().toISOString();
    this._write(data);
    return options.new !== false ? this._wrapDoc(data[index]) : this._wrapDoc(data[index]);
  }

  /**
   * Update many documents matching filter
   */
  async updateMany(filter, update) {
    const data = this._read();
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      if (this._matches(data[i], filter)) {
        if (update.$set) {
          for (const [key, val] of Object.entries(update.$set)) {
            this._setNestedValue(data[i], key, val);
          }
        }
        if (update.$inc) {
          for (const [key, val] of Object.entries(update.$inc)) {
            const current = this._getNestedValue(data[i], key) || 0;
            this._setNestedValue(data[i], key, current + val);
          }
        }
        data[i].updatedAt = new Date().toISOString();
        count++;
      }
    }

    this._write(data);
    return { modifiedCount: count };
  }

  /**
   * Delete many
   */
  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this._write([]);
      return { deletedCount: this._read().length };
    }
    const data = this._read();
    const remaining = data.filter(d => !this._matches(d, filter));
    this._write(remaining);
    return { deletedCount: data.length - remaining.length };
  }

  /**
   * Count documents
   */
  async countDocuments(filter = {}) {
    const data = this._read();
    return data.filter(d => this._matches(d, filter)).length;
  }

  /**
   * Simple aggregate (supports $match and $group with $sum)
   */
  async aggregate(pipeline) {
    let data = this._read();

    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(d => this._matches(d, stage.$match));
      }
      if (stage.$group) {
        const result = {};
        const groupId = stage.$group._id;
        
        for (const doc of data) {
          const key = groupId ? this._getNestedValue(doc, groupId.replace('$', '')) : 'all';
          if (!result[key]) {
            result[key] = { _id: key === 'all' ? null : key };
          }
          for (const [field, op] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (op.$sum) {
              const val = typeof op.$sum === 'string' 
                ? this._getNestedValue(doc, op.$sum.replace('$', '')) || 0
                : op.$sum;
              result[key][field] = (result[key][field] || 0) + val;
            }
          }
        }
        data = Object.values(result);
      }
    }

    return data;
  }

  /**
   * Wrap raw doc with Mongoose-like methods
   */
  _wrapDoc(doc) {
    if (!doc) return null;
    const db = this;
    const wrapped = { ...doc };

    wrapped.toObject = function() { return { ...this }; };
    wrapped.toJSON = function() { return { ...this }; };

    wrapped.save = async function() {
      const data = db._read();
      const idx = data.findIndex(d => String(d._id) === String(this._id));
      if (idx !== -1) {
        // Copy all properties back
        for (const key of Object.keys(this)) {
          if (typeof this[key] !== 'function') {
            data[idx][key] = this[key];
          }
        }
        data[idx].updatedAt = new Date().toISOString();
        db._write(data);
      }
      return this;
    };

    wrapped.deleteOne = async function() {
      const data = db._read();
      const filtered = data.filter(d => String(d._id) !== String(this._id));
      db._write(filtered);
      return { deletedCount: data.length - filtered.length };
    };

    // toString for ObjectId-like behavior
    wrapped.toString = function() { return this._id; };

    return wrapped;
  }
}

/**
 * Query chain for .find() results
 */
class Query {
  constructor(results) {
    this._results = results;
    this._sortFn = null;
    this._limitVal = null;
    this._populateFields = [];
    this._selectFields = null;
  }

  sort(sortSpec) {
    if (typeof sortSpec === 'string') {
      const desc = sortSpec.startsWith('-');
      const field = desc ? sortSpec.slice(1) : sortSpec;
      this._results.sort((a, b) => {
        const va = a[field], vb = b[field];
        if (va < vb) return desc ? 1 : -1;
        if (va > vb) return desc ? -1 : 1;
        return 0;
      });
    } else if (typeof sortSpec === 'object') {
      const [field, dir] = Object.entries(sortSpec)[0] || [];
      if (field) {
        this._results.sort((a, b) => {
          if (a[field] < b[field]) return dir === -1 ? 1 : -1;
          if (a[field] > b[field]) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
    }
    return this;
  }

  limit(n) {
    this._limitVal = n;
    return this;
  }

  populate(field, selectStr) {
    // No-op for JSON DB (data is already flat/embedded)
    this._populateFields.push({ field, selectStr });
    return this;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  // Make it thenable (so `await collection.find()` works)
  then(resolve, reject) {
    try {
      let results = [...this._results];
      if (this._limitVal) results = results.slice(0, this._limitVal);
      // Wrap each result
      resolve(results);
    } catch (e) {
      reject(e);
    }
  }
}

/**
 * Single query for .findOne() / .findById()
 */
class SingleQuery {
  constructor(doc, db, filter) {
    this._doc = doc ? db._wrapDoc(doc) : null;
    this._db = db;
    this._filter = filter;
    this._selectFields = null;
  }

  select(fields) {
    // Handle +password to include hidden fields
    if (this._doc && fields === '+password') {
      // Password is already in the doc (JSON has no field hiding)
    }
    this._selectFields = fields;
    return this;
  }

  populate(field, selectStr) {
    return this;
  }

  then(resolve, reject) {
    try {
      resolve(this._doc);
    } catch (e) {
      reject(e);
    }
  }
}

/**
 * Create a collection (returns a JsonDB instance)
 */
export function createCollection(name) {
  return new JsonDB(name);
}

export default JsonDB;
