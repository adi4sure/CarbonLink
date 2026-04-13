import { generateIpfsHash } from '../utils/hashGenerator.js';

/**
 * Mock IPFS Storage Service
 * In production, this would pin files to IPFS via Pinata or Infura
 */

/**
 * Store proof photos and return IPFS-like hash
 * @param {Array} files - Multer file objects
 * @returns {Object} - { ipfsHash, urls }
 */
export async function storeProofPhotos(files) {
  // Generate mock IPFS hash from file data
  const fileData = files.map(f => `${f.filename}-${f.size}`).join('|');
  const ipfsHash = generateIpfsHash(fileData);

  // In production: upload to IPFS and return actual CID
  // For MVP: return local file paths
  const urls = files.map(f => `/uploads/${f.filename}`);

  return {
    ipfsHash,
    urls,
  };
}

/**
 * Retrieve proof data by hash
 * @param {string} hash - The IPFS hash
 * @returns {Object|null}
 */
export async function getProofByHash(hash) {
  // Mock: In production this would fetch from IPFS gateway
  return {
    hash,
    gateway: `https://ipfs.io/ipfs/${hash}`,
    cached: true,
  };
}
