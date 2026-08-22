const fs = require('node:fs').promises;
const { logSuccess, logFailure } = require('./logger');

async function readJsonFile(filePath) { 
    const data = await fs.readFile(filePath, 'utf8'); 
    const jsonObject = JSON.parse(data); 
    return jsonObject;
} 

async function writeJsonFile(filePath, data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf8');
        logSuccess('JSON file written successfully!');
    } catch (err) {
        logFailure('Error writing JSON file:', err);
    }
}

/**
 *
 * @param {string} filePath - Path to file
 * @param {string|object} keyOrObject
 * @param {any} [value]
 */
async function updateJsonField(filePath, keyOrObject, value) {
    try {
        const currentData = await readJsonFile(filePath);

        if (typeof keyOrObject === 'string') {
            currentData[keyOrObject] = value;
        } else if (typeof keyOrObject === 'object' && keyOrObject !== null) {
            Object.assign(currentData, keyOrObject);
        }

        await writeJsonFile(filePath, currentData);
    } catch (err) {
        logFailure('Error updating JSON field:', err);
    }
}

module.exports = { readJsonFile, writeJsonFile, updateJsonField }