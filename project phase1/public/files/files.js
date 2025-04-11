const fs = require('fs').promises;
const path = require('path');

const readJSON = async (fileName) => {
    const data = await fs.readFile(path.join(__dirname, `../data/${fileName}`));
    return JSON.parse(data);
};

const writeJSON = async (fileName, data) => {
    await fs.writeFile(path.join(__dirname, `../data/${fileName}`), JSON.stringify(data, null, 2));
};

module.exports = { readJSON, writeJSON };
