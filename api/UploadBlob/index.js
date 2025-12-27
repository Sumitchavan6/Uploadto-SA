const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');

module.exports = async function (context, req) {
    try {
        const connectionString = process.env.STORAGE_CONNECTION;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient("uploads");

        // IMPORTANT: Ensure the body exists
        if (!req.body || !req.headers['content-type']) {
            context.res = { status: 400, body: "Missing file data" };
            return;
        }

        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.Parse(req.body, boundary);
        const file = parts[0];

        const blockBlobClient = containerClient.getBlockBlobClient(file.filename);
        
        // Use the buffer directly from the parsed part
        await blockBlobClient.upload(file.data, file.data.length);

        context.res = { body: { message: "File uploaded successfully!" } };
    } catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: `Error: ${err.message}` };
    }
};
