const config = require('../config');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(Promise);

AWS.config.update(config.awsconfig);

const s3 = new AWS.S3({
  params: {
    Bucket: config.awsconfig.s3_bucket
  }
});

const uploadAsync = async (s3ThumbnailKey, thumbBuffer) => {

  await s3.upload({
    ACL: 'public-read',
    ContentType: 'image/jpeg',
    Key: s3ThumbnailKey,
    Body: thumbBuffer
  }).promise();

};

exports.uploadAsync = uploadAsync;


