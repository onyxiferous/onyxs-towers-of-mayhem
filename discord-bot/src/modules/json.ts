import { promises as fs } from 'node:fs';
import { logSuccess, logFailure } from './logger.js';

async function readJsonFile(filePath: string) {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonObject = JSON.parse(data);
    return jsonObject;
}

async function writeJsonFile(filePath: string, data: string) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf8');
        logSuccess('JSON file written successfully!');
    } catch (err) {
        logFailure(`Error writing JSON file because ${err}.`);
    }
}

async function updateJsonField(filePath: string, keyOrObject: string, value: string) {
    try {
        const currentData = await readJsonFile(filePath);

        if (typeof keyOrObject === 'string') {
            currentData[keyOrObject] = value;
        } else if (typeof keyOrObject === 'object' && keyOrObject !== null) {
            Object.assign(currentData, keyOrObject);
        }

        await writeJsonFile(filePath, currentData);
    } catch (err) {
        logFailure(`Error updating JSON field because ${err}`);
    }
}

export { readJsonFile, writeJsonFile, updateJsonField }