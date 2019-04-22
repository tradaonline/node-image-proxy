const config = require('../config');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const url = require('url');
const shorthash = require('shorthash');
const uuid = require('uuid/v4');
const got = require('got');
const sharp = require('sharp');
const debug = require('debug')('complex:route');
const createError = require('http-errors');
const rdscli = require('../libs/redisPromise').rdscli;
const shell = require('shelljs');
const awsS3Uploader = require('../libs/awsS3Uploader');
const PermissionChecker = require('../libs/PermissionChecker');

router.get('/:uri(*)', (req, res, next) => {

  debug('complex');

  const referrer = req.get('Referrer');
  const param = req.query.param;
  let uri = req.params.uri;

  let urlInfo = url.parse(uri);

  debug('uri:', uri);
  debug('param:', req.query.param);
  debug('urlInfo:', urlInfo);

  if (!PermissionChecker.isAllowTargetHosts(urlInfo.hostname)) {
    return next(createError(404, 'not allowed host'));
  }

  if (!PermissionChecker.isAllowReferrers(referrer)) {
    return next(createError(404, 'not allowed referrer'));
  }


  next();

});

router.get('/:uri(*)', (req, res) => {

  const param = req.query.param;
  let uri = req.params.uri;

  let uriHash = shorthash.unique(`${uri}${param}`);
  let hashKey = uriHash.substr(-1);

  debug('uriHash:', uriHash);
  debug('hashKey:', hashKey);

  rdscli.hgetAsync(`imageproxy:complex:${hashKey}`, uriHash).then(async (rs) => {

    let mode = config.mode;
    let cdnHost = config.paths.domain_name;

    let uriObj = {};

    if (rs) {

      uriObj = JSON.parse(rs);

      if (uriObj.url) {
        debug('### from redis cache');

        return res.redirect(config.httpResponseStatusCode, `${cdnHost}/${uriObj.url}`);
      }
    }

    debug('start image processing');

    let headers = (await got.head(uri)).headers;

    let contentType = headers['content-type'];
    let contentLength = +headers['content-length'];

    debug(contentType);

    if (!PermissionChecker.isAllowMimetypes(contentType)) {
      debug(`Not allowed content-type: ${uri}:::${req.headers.referer}`);
      console.error(`Not allowed content-type: ${uri}:::${req.headers.referer}`);
      return res.redirect(302, '/no-image.png');
    }

    if (!PermissionChecker.isAllowMaxContentLength(contentLength)) {
      debug(`overflowed content-length: ${uri}:::${req.headers.referer}`);
      console.error(`overflowed content-length: ${uri}:::${req.headers.referer}`);
      return res.redirect(302, '/no-image.png');
    }

    debug('download image');

    let imageBody = (await got(uri, { encoding: null })).body;

    let newFilename = `${uuid()}.${contentType.substring(contentType.indexOf('/')+1)}`;

    debug('make Thumbnail');

    let baseUploadPath = `${moment().format('YYYY/MM/DD')}`;
    let s3ThumbnailKey = `${baseUploadPath}/complex/${newFilename}`;
    let localThumbnailKey = `${config.paths.upload_path}/${baseUploadPath}/complex/${newFilename}`;

    // const parseParams = parseParam(param);

    // debug('parseOptions:', parseParams);

    let sharpChain = sharp(imageBody);

    let params;

    try {
      params = JSON.parse( decodeURI(param));
    } catch (err) {
      debug(err);
      console.error(err);
      return createError(400, 'error');
    }


    debug('==============params', params);
    debug('==============localThumbnailKey', localThumbnailKey);

    for (let name in params) {

      debug('name', name);

      if (!PermissionChecker.isAllowComplex(name)) {
        console.error('PermissionChecker.isAllowComplex Error');
        return res.redirect(302, '/no-image.png');
      }
      // params[name]

      try {

        debug(name, params[name]);


        if (name === 'composite') {

          if ( params[name].length !== 0 ) {

            for (let [i, option] of params[name].entries()) {
              let inputBody = (await got(option.input, { encoding: null })).body;
              params[name][i].input = inputBody;
            }
          }
        }

        sharpChain = sharpChain[name]( params[name] );

      } catch (err) {

        console.error(err);
      }

    }

    // local
    if (mode === 'local') {

      let localPath = `public${config.paths.upload_path}/${baseUploadPath}/complex`;
      if (!fs.existsSync(localPath)) {
        // fs.mkdirSync(localPath, { recursive: true });
        shell.mkdir('-p', localPath);
      }

      await sharpChain.toFile(`public${localThumbnailKey}`);
      // let thumbFile = await sharp(imageBody).resize(par).toFile(`public/${localThumbnailKey}`);

      uriObj.url = localThumbnailKey;

      await rdscli.hsetAsync(`imageproxy:complex:${hashKey}`, uriHash, JSON.stringify(uriObj));

      // non redirect code
      // res.contentType('image/jpeg');
      // return res.sendFile(`/Users/rkjun/dev/gitlab/node-image-proxy/public${localThumbnailKey}`);

      // original code
      debug(`${cdnHost}${localThumbnailKey}`);
      return res.redirect(config.httpResponseStatusCode, `${cdnHost}${localThumbnailKey}`);

    } else if (mode === 's3') {

      // s3
      let thumbBuffer = await sharpChain.toBuffer();
      debug('s3 upload');


      await awsS3Uploader.uploadAsync(s3ThumbnailKey, thumbBuffer);

      uriObj.url = s3ThumbnailKey;

      await rdscli.hsetAsync(`imageproxy:complex:${hashKey}`, uriHash, JSON.stringify(uriObj));

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
    return res.redirect(302, '/no-image.png');

  });

});

module.exports = router;
