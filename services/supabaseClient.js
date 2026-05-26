// Compatibility layer: provide a minimal Supabase-like API that proxies
// common operations to MongoDB. This allows existing code (sb.from(...)) to
// keep working while we migrate models to native Mongo/Mongoose.
const { connectToMongo } = require('./mongoClient');

class QueryBuilder {
  constructor(collectionOrName) {
    this.collection = null;
    this.collectionName = null;
    if (typeof collectionOrName === 'string') {
      this.collectionName = collectionOrName;
    } else if (collectionOrName) {
      this.collection = collectionOrName;
    }
    this.filter = {};
    this._projection = null;
    this._sort = null;
    this._limit = null;
    this._skip = null;
    this._op = null; // 'insert'|'update'|'delete'
    this._updateDoc = null;
    this._insertDoc = null;
    this._countHead = false;
  }

  async getCollection() {
    if (this.collection) return this.collection;
    const conn = await connectToMongo();
    this.collection = conn.db.collection(this.collectionName);
    return this.collection;
  }

  select(fields, opts) {
    if (opts && opts.count === 'exact' && opts.head) {
      this._countHead = true;
    }
    if (fields && fields !== '*') {
      const proj = {};
      fields.split(',').map((f) => f.trim()).forEach((f) => { proj[f] = 1; });
      this._projection = proj;
    }
    return this;
  }

  eq(field, value) {
    this.filter[field] = value;
    return this;
  }

  gte(field, value) {
    this.filter[field] = { ...(this.filter[field] || {}), $gte: value };
    return this;
  }

  lte(field, value) {
    this.filter[field] = { ...(this.filter[field] || {}), $lte: value };
    return this;
  }

  in(field, arr) {
    this.filter[field] = { $in: arr };
    return this;
  }

  order(field, opts = {}) {
    this._sort = { [field]: opts.ascending === false ? -1 : 1 };
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  insert(doc) {
    this._op = 'insert';
    this._insertDoc = doc;
    return this;
  }

  update(doc) {
    this._op = 'update';
    this._updateDoc = doc;
    return this;
  }

  delete() {
    this._op = 'delete';
    return this;
  }

  async execFind() {
    const collection = await this.getCollection();
    if (this._countHead) {
      const count = await collection.countDocuments(this.filter);
      return { count };
    }
    const cursor = collection.find(this.filter, { projection: this._projection });
    if (this._sort) cursor.sort(this._sort);
    if (this._limit) cursor.limit(this._limit);
    const data = await cursor.toArray();
    // map _id to id for Supabase-like compatibility
    const mapped = data.map((d) => {
      if (d && d._id && !d.id) d.id = String(d._id);
      return d;
    });
    return { data: mapped };
  }

  async maybeSingle() {
    try {
      if (this._op === 'insert') {
        const collection = await this.getCollection();
        const res = await collection.insertOne(this._insertDoc);
        const inserted = await collection.findOne({ _id: res.insertedId });
        if (inserted && inserted._id && !inserted.id) inserted.id = String(inserted._id);
        return { data: inserted, error: null };
      }
      if (this._op === 'update') {
        const collection = await this.getCollection();
        const res = await collection.findOneAndUpdate(
          this.filter, 
          { $set: this._updateDoc }, 
          { returnDocument: 'after' }
        );
        // MongoDB driver v4+ returns the document directly or in .value depending on version/config
        const doc = res.value || res;
        if (doc && doc._id && !doc.id) doc.id = String(doc._id);
        return { data: (doc && doc._id) ? doc : null, error: null };
      }
      if (this._op === 'delete') {
        const collection = await this.getCollection();
        const res = await collection.deleteMany(this.filter);
        return { data: null, error: null };
      }
      // findOne for maybeSingle
      const collection = await this.getCollection();
      const doc = await collection.findOne(this.filter, { projection: this._projection });
      if (doc && doc._id && !doc.id) doc.id = String(doc._id);
      return { data: doc, error: null };
    } catch (err) {
      console.error('Supabase Mock Error:', err);
      return { data: null, error: err };
    }
  }

  async single() {
    const r = await this.maybeSingle();
    if (r.error) {
      console.error('Supabase single() error:', r.error);
      throw r.error;
    }
    if (!r.data) {
      console.warn('Supabase single() - No rows returned for filter:', JSON.stringify(this.filter));
      return { data: null, error: new Error('No rows returned') };
    }
    return r;
  }

  then(resolve, reject) {
    this.execFind().then(resolve).catch(reject);
  }
}

function fromFactory(collectionName) {
  return (conn) => new QueryBuilder(conn.db.collection(collectionName));
}

function getSupabase() {
  // Return a small client with `.from(name)` that mirrors the Supabase client enough
  // for existing code paths. Connection is established lazily when queries run.
  return {
    from: (name) => new QueryBuilder(name),
  };
}

module.exports = { getSupabase };
module.exports.default = module.exports;
