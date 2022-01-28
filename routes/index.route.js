const config = require('../config');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const url = require('url');
const shorthash = require('shorthash');
const { v4: uuidv4 } = require('uuid');
const got = require('got');
const sharp = require('sharp');
const debug = require('debug')('index:route');
const createError = require('http-errors');
const rdscli = require('../libs/redisPromise').rdscli;
const shell = require('shelljs');
const awsS3Uploader = require('../libs/awsS3Uploader');
const parseOption = require('../libs/optionParser').parseOption;
const PermissionChecker = require('../libs/PermissionChecker');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'node-image-proxy' });
});

router.get('/:options/:uri(*)', (req, res, next) => {

  const referrer = req.get('Referrer');
  const options = req.params.options;
  let uri = req.params.uri;

  let urlInfo = url.parse(uri);

  debug('uri:', uri);
  debug('options:', options);
  debug('urlInfo:', urlInfo);

  if ( !PermissionChecker.isAllowTargetHosts(urlInfo.hostname) ) {
    return next(createError(404, 'not allowed host'));
  }

  if ( !PermissionChecker.isAllowReferrers(referrer) ) {
    return next(createError(404, 'not allowed referrer'));
  }

  if (!PermissionChecker.isAllowOptions(options)) {
    return next(createError(404, 'not allowed options'));
  }

  next();

});

router.get('/:options/:uri(*)', (req, res) => {

  const options = req.params.options;
  let uri = req.params.uri;

  let uriHash = shorthash.unique(`${options}${uri}`);
  let hashKey = uriHash.substr(-1);

  debug('uriHash:', uriHash);
  debug('hashKey:', hashKey);

  rdscli.hgetAsync(`imageproxy:thumb:${hashKey}`, uriHash).then( async (rs) => {

    let mode = config.mode;
    let cdnHost = config.paths.domain_name;

    let uriObj = {};

    if( rs ){

      uriObj = JSON.parse(rs);

      if( uriObj[`${options}`] ){
        debug('### from redis cache');

        return res.redirect(config.httpResponseStatusCode, `${cdnHost}/${uriObj[`${options}`]}` );
      }
    }

    debug('start image processing');

    let headers = ( await got.head( uri ) ).headers;

    let contentType = headers['content-type'];
    let contentLength = +headers['content-length'];

    debug(contentType);

    if (!PermissionChecker.isAllowMimetypes(contentType)) {
      debug(`Not allowed content-type: ${uri}:::${req.headers.referer}`);
      console.error(`Not allowed content-type: ${uri}:::${req.headers.referer}`);
      return res.redirect(302, '/no-image.png');
    }

    if(!PermissionChecker.isAllowMaxContentLength(contentLength)) {
      debug(`overflowed content-length: ${uri}:::${req.headers.referer}`);
      console.error(`overflowed content-length: ${uri}:::${req.headers.referer}`);
      return res.redirect(302, '/no-image.png');
    }

    debug('download image');

    let imageBody = (await got(uri, { encoding: null })).body;

    let newFilename = `${uuidv4()}.${contentType.substring(contentType.indexOf('/') + 1)}`;

    debug('make Thumbnail');

    let baseUploadPath = `${moment().format('YYYY/MM/DD')}`;
    let s3ThumbnailKey = `${baseUploadPath}/${options}/${newFilename}`;
    let localThumbnailKey = `${config.paths.upload_path}/${baseUploadPath}/${options}/${newFilename}`;

    debug('options', options);
    const parseOptions = parseOption(options);

    debug('parseOptions:', parseOptions);

    let sharpChain = sharp(imageBody);

    for (let name in parseOptions) {

      debug('name', name);

      try {

        debug(name, parseOptions[name]);

        sharpChain = sharpChain[name](parseOptions[name]);

      } catch (err) {

        console.error(err);
      }

    }


    // local
    if (mode === 'local') {

      let localPath = `public${config.paths.upload_path}/${baseUploadPath}/${options}`;
      if (!fs.existsSync(localPath)) {
        // fs.mkdirSync(localPath, { recursive: true });
        shell.mkdir('-p', localPath);
      }

      await sharpChain.toFile(`public${localThumbnailKey}`);
      // let thumbFile = await sharp(imageBody).resize(par).toFile(`public/${localThumbnailKey}`);

      uriObj[`${options}`] = localThumbnailKey;

      await rdscli.hsetAsync(`imageproxy:thumb:${hashKey}`, uriHash, JSON.stringify(uriObj));

      // non redirect code
      // res.contentType('image/jpeg');
      // return res.sendFile(`/Users/rkjun/dev/gitlab/node-image-proxy/public${localThumbnailKey}`);

      // original code
      debug(`redirect : ${cdnHost}${localThumbnailKey}`);
      return res.redirect(config.httpResponseStatusCode, `${cdnHost}${localThumbnailKey}`);

    } else if (mode === 's3') {

      // s3
      let thumbBuffer = await sharpChain.toBuffer();
      debug('s3 upload');

      await awsS3Uploader.uploadAsync(s3ThumbnailKey, thumbBuffer);

      uriObj[`${options}`] = s3ThumbnailKey;

      await rdscli.hsetAsync(`imageproxy:thumb:${hashKey}`, uriHash, JSON.stringify(uriObj));

      if (cdnHost === '') {
        cdnHost = `https://s3.${config.awsconfig.region}.amazonaws.com/${config.awsconfig.s3_bucket}`;
      }

      return res.redirect(config.httpResponseStatusCode, `${cdnHost}/${s3ThumbnailKey}`);

    } else {
      debug('set mode in CONFIG.js');
      console.error('set mode in CONFIG.js');
      return res.redirect(302, '/no-image.png');
    }

  }).catch(err => {

    debug(`error ${req.headers.referer}`, err);
    console.error(`error ${req.headers.referer}`, err);
    return res.redirect(302, '/no-image.png' );

  });

});

module.exports = router;
