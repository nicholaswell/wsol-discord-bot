const fs = require('fs');
const path = require('path');

module.exports = (directory, foldersOnly = false) => {
    let fileNames = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (foldersOnly) {
            if (file.isDirectory()) {
                fileNames.push(filePath);
            }
        } else {
            fileNames.push(filePath); // Include both files and folders when foldersOnly is false
        }
    }

    return fileNames;
};