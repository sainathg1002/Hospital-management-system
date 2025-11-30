const mongoose = require('mongoose');
const connections = new Map();

/**
 * Create or return an existing tenant-specific Mongoose connection.
 * We keep a map of connections keyed by tenantId.
 */
function getTenantConnection(mongoUri, tenantId) {
  const dbName = `tenant_${tenantId}`;
  const key = `${mongoUri}_${dbName}`;
  if (connections.has(key)) return connections.get(key);
  const uri = new URL(mongoUri);
  // Append dbName to the URI path
  // If the URI already contains a DB name, override it
  const base = `${uri.protocol}//${uri.hostname}${uri.port ? `:${uri.port}` : ''}`;
  const auth = uri.username ? `${uri.username}:${uri.password}@` : '';
  const fullUri = `${uri.protocol}//${auth}${uri.hostname}${uri.port ? `:${uri.port}` : ''}/${dbName}${uri.search}`;

  const conn = mongoose.createConnection(fullUri, {});
  connections.set(key, conn);
  return conn;
}

module.exports = { getTenantConnection };
