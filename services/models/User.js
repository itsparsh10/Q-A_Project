const { connectToMongo, getMongoose } = require('../../services/mongoClient');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'user' },
    subscription_id: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    external_user_id: { type: String, default: null },
    additional_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// helper to convert mongoose doc to compatibility object
function toUser(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  o.id = o._id ? String(o._id) : o.id;
  return o;
}

// Ensure model is registered after connection
let UserModel;
async function ensureModel() {
  if (UserModel) return UserModel;
  await connectToMongo();
  const mongooseInst = getMongoose();
  UserModel = mongooseInst.models.User || mongooseInst.model('User', userSchema);
  return UserModel;
}

async function findById(id) {
  if (!id) return null;
  const M = await ensureModel();
  const doc = await M.findById(id).lean();
  return doc ? toUser(doc) : null;
}

async function findOne(query) {
  const M = await ensureModel();
  const q = {};
  if (query.email) q.email = String(query.email).toLowerCase();
  if (query.externalUserId !== undefined) q.external_user_id = query.externalUserId;
  const doc = await M.findOne(q).lean();
  return doc ? toUser(doc) : null;
}

async function findByIdAndUpdate(id, update) {
  const M = await ensureModel();
  const patch = {};
  if (update.email !== undefined) patch.email = update.email;
  if (update.password !== undefined) patch.password = update.password;
  if (update.name !== undefined) patch.name = update.name;
  if (update.role !== undefined) patch.role = update.role;
  if (update.isActive !== undefined) patch.is_active = update.isActive;
  if (update.Subscription_id !== undefined) patch.subscription_id = update.Subscription_id;
  if (update.additionalData !== undefined) patch.additional_data = update.additionalData;
  if (update.additional_data !== undefined) patch.additional_data = update.additional_data;
  const doc = await M.findByIdAndUpdate(id, patch, { new: true }).lean();
  return doc ? toUser(doc) : null;
}

async function createUser(data) {
  const M = await ensureModel();
  const doc = await M.create({
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role || 'user',
    is_active: data.isActive !== undefined ? data.isActive : true,
    subscription_id: data.subscription_id || data.Subscription_id || null,
    external_user_id: data.externalUserId || null,
    additional_data: data.additionalData || data.additional_data || {},
  });
  return toUser(doc);
}

async function countDocuments(filter = {}) {
  const M = await ensureModel();
  const q = {};
  if (filter.createdAt && filter.createdAt.$gte) {
    q.created_at = { $gte: filter.createdAt.$gte };
  }
  return M.countDocuments(q);
}

async function findByIdAndDelete(id) {
  const M = await ensureModel();
  await M.deleteOne({ _id: id });
}

class User {
  constructor(data) {
    Object.assign(this, data);
    if (data.additionalData) this.additionalData = data.additionalData;
  }
  async save() {
    const created = await createUser({
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      additionalData: this.additionalData,
      externalUserId: this.externalUserId,
      _id: this._id,
      id: this.id,
    });
    Object.assign(this, created);
    this._id = created._id || created.id;
    return this;
  }
}

User.findById = findById;
User.findOne = findOne;
User.findByIdAndUpdate = findByIdAndUpdate;
User.findByIdAndDelete = findByIdAndDelete;
User.create = async (data) => createUser(data);
User.countDocuments = countDocuments;

module.exports = User;
