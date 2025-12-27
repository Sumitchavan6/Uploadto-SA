const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');

module.exports = async function (context, req) {
    // 1. Get Connection String from App Settings
    const connectionString = process.env.STORAGE_CONNECTION;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient("uploads");

    // 2. Parse the file from the request
    const bodyBuffer = Buffer.from(req.body);
    const boundary = multipart.getBoundary(req.headers['content-type']);
    const parts = multipart.Parse(bodyBuffer, boundary);

    const file = parts[0]; // The actual file
    const fileName = file.filename;

    // 3. Upload to Azure
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.upload(file.data, file.data.length);

    context.res = { body: { message: "File uploaded!" } };
};