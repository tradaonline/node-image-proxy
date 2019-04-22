# node-image-proxy

[![HitCount](http://hits.dwyl.io/marcjacobs1021/node-image-proxy.svg)](http://hits.dwyl.io/marcjacobs1021/node-image-proxy)



node-image-proxy is a caching image proxy server written in Node.js.

- resizing and converting remote images
- serving aws s3 or localhost
- caching in-memory on Redis
<br>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [URLStructure](#urlstructure)
  - [Options](#options)
  - [Example](#example)
  - [Remote URL](#remote-url)
  - [`complex` route for advanced users](#complex-route-for-advanced-users)
  - [Using Docker](#using-docker)
- [How it works?](#how-it-works)
- [Configuration](#configuration)
  - [Example](#example-1)
    - [localhost mode](#localhost-mode)
    - [aws s3 mode](#aws-s3-mode)
    - [Permission](#permission)
- [Benchmark](#benchmark)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>

## Requirements

- Node.js >= 8
- Redis Server - It stores the converted URL's cache.
- AWS S3 `Optional`
- CDN `Optional`
<br>

## Getting Started

```sh
$ npm i
$ npm start
$ curl -I http://localhost:3000/w200/https://example.com/image.jpg
HTTP/1.1 301 Moved Permanently
Location: /uploads/2019/03/14/w200/8bbaa9b8-eb59-4a95-92ac-1505369abf4b.jpg
...
# you will get your resized image url follows :
# http://localhost:3000/uploads/2019/03/14/w200/8bbaa9b8-eb59-4a95-92ac-1505369abf4b.jpg
```

- With [PM2](https://github.com/Unitech/pm2)

```sh
$ pm2 start
$ curl -I http://localhost:3000/w200/https://example.com/image.jpg
HTTP/1.1 301 Moved Permanently
Location: /uploads/2019/03/14/w200/8bbaa9b8-eb59-4a95-92ac-1505369abf4b.jpg
```
<br>

### URLStructure

nodex-image-proxy URLs are of the form http://localhost/{options}/{remote_url}.
<br>

### Options

Options are available for resizing, rotation, output format, flip, flop and greyscale.
Options for are specified as a comma delimited list of parameters, which can be supplied in any order. Duplicate parameters overwrite previous values.
<br>

### Example

ogirinal sample image ( 1280 by 768 pixels) [link](https://user-images.githubusercontent.com/48664213/55446760-f6f64e00-55fb-11e9-9505-b3479efd112d.jpg)

| Options        | Meaning                                                                                                                         | Image                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| w200           | 200 pixels wide, auto-scaled height                       <br>`example` http://localhost/w200/http://example.com/image.jpg      | ![w200_sample](https://user-images.githubusercontent.com/48664213/55446839-5bb1a880-55fc-11e9-8cb5-91a3499bd036.jpg)              |
| h100           | 100 pixels high, auto-scaled width                        <br>`example` http://localhost/h100/http://example.com/image.jpg      | ![h100_sample](https://user-images.githubusercontent.com/48664213/55446843-64a27a00-55fc-11e9-96e7-7bb8facf2fd3.jpg)              |
| w200,h300      | 200 pixels wide and 300 pixels high image                 <br>`example` http://localhost/w200,h300/http://example.com/image.jpg | ![w200,h300_sample](https://user-images.githubusercontent.com/48664213/55446852-69672e00-55fc-11e9-9624-4a08da9702a7.jpg)    |
| wh100          | 100 pixels wide and 100 pixels high image                 <br>`example` http://localhost/wh100/http://example.com/image.jpg     | ![wh100_sample](https://user-images.githubusercontent.com/48664213/55446932-b0edba00-55fc-11e9-9862-fee517caba78.jpg)     |
| w100,r90       | 100 pixels wide, rotated 90 degrees                       <br>`example` http://localhost/w100,r90/http://example.com/image.jpg  | ![w100,r90_sample](https://user-images.githubusercontent.com/48664213/55458555-39358480-5628-11e9-8242-c153de82b679.jpeg)    |
| w200,png       | 200 pixels wide, converted to PNG format                  <br>`example` http://localhost/w200,png/http://example.com/image.jpg  | ![w200,png](https://user-images.githubusercontent.com/48664213/55458996-63d40d00-5629-11e9-89f4-c69c37919441.jpeg)    |
| w200,grey      | 200 pixels wide, converted to 8-bit greyscale             <br>`example` http://localhost/w200,grey/http://example.com/image.jpg | ![w200,grey](https://user-images.githubusercontent.com/48664213/55459052-85cd8f80-5629-11e9-9aa0-d9fad39aac1d.jpeg)    |
| w200,flip      | 200 pixels wide, flip the image about the vertical Y axis <br>`example` http://localhost/w200,flip/http://example.com/image.jpg | ![w200,flip](https://user-images.githubusercontent.com/48664213/55461193-d0053f80-562e-11e9-8de8-cc2c6413f3a5.jpeg)    |

The full options are:

- `wh`:number - Resize image to width x height. Crop to cover both provided dimensions.
- `h`:number - Resize image to height. Auto-scale the width to match the height.
- `w`:number - Resize image to width. Auto-scale the height to match the width.
- `r`:number - Rotate the output image by angle. it is converted to a valid positive degree rotation. For example, -450 will produce a 270deg rotation.
- `jpg`, `jpeg` - JPEG output.
- `png` - PNG output. It is always full colour at 8 or 16 bits per pixel. Indexed PNG input at 1, 2 or 4 bits per pixel is converted to 8 bits per pixel.
- `webp` - WEBP output.
- `flip` - Flip the image about the vertical Y axis.
- `flop` - Flop the image about the horizontal X axis.
- `grey` `gray` `greyscale` `grayscale` - Convert to 8-bit greyscale
<br>

### Remote URL

The URL of the original image to load is specified as the remainder of the path, without any encoding.
<br>

### `complex` route for advanced users

To use almost features (and detail options) of [sharp](https://github.com/lovell/sharp), use `complex` route and JSON Object parameter :

  - http://localhost/complex/{remote_url}?param=JSON OBJECT

- Resize
  - http://localhost/complex/{remote_url}?param={"resize":{"height":300,"width":300}}

- Composite
  - http://localhost/complex/{remote_url}?param={"composite":[{"input":"remote_overy_url","gravity":"southeast"}]}

- Resize and Composite
  - http://localhost/complex/{remote_url}?param={"resize":{"height":300,"width":300},"composite":[{"input":"remote_overy_url","gravity":"southeast"}]}

* If the JSON parameter contains characters that require URI encoding, the JSON parameter need URI encoding.

For example,
  - JavaScript `encodeURI`
```
encodeURI('param={"resize":500, "flop":true, "composite":[{ "input": "http://example.comremote_input_image.png", "gravity": "centre" }], "grayscale": false}');

// output
param=%7B%22resize%22:500,%20%22flop%22:true,%20%22composite%22:%5B%7B%20%22input%22:%20%22http://example.comremote_input_image.png%22,%20%22gravity%22:%20%22centre%22%20%7D%5D,%20%22grayscale%22:%20false%7D
```
  - Java `URLEncoder.encode`
  - PHP `urlencode`
<br>

### Using Docker

image-proxy can (and should) be used as a application inside a Docker container. Just pull the official image from Docker Hub:


```sh
# If redis is not running, run redis before running node-image-proxy.
$ docker run --name redis -d redis
$ docker pull marcjacobs1021/node-image-proxy:latest
$ docker run -p 3000:3000 --link redis:redis --name node-image-proxy -d marcjacobs1021/node-image-proxy
...
# If redis is running (REDIS_HOST 6379 port), run node-image-proxy.
$ docker pull marcjacobs1021/node-image-proxy:latest
$ docker run -p 3000:3000 -e REDIS='REDIS_HOST' --name node-image-proxy -d marcjacobs1021/node-image-proxy
```
<br>

## How it works?

1. Access URL by specifying option and remote URL.
   - http://localhost:3000/w200/https://example.com/image.jpg
2. Verify that it is allowed host.
3. Make sure the option & URL cached in Redis.
4. If cached, return redirect cached URL.
5. If not cached, download remote url's image & upload local (or aws s3) server, caching, and return redirect URL.
<br>

## Configuration

Configuration can be modified in the `config.js` file.
<br>

### Example
<br>

#### localhost mode

```js
module.exports = {
  /**
   * HTTP Response Status Code
   * default : 302
   */
  'httpResponseStatusCode': 302,
  /**
   * Select mode 'local' or 's3'.
   * It means the upload target server. default 'local'
   */
  'mode': 'local',
  /**
   * node-image-proxy server's default port
   */
  'port': 3000,
  /**
   * Redis Server Information
   * default :
   *   'host': '127.0.0.1',
   *   'port': 6379,
   *   'db': 0
   */
  'redisServer': {
    'host': '127.0.0.1',
    'port': 6379,
    'db': 0
  },
  'paths':{
    /**
     * Your Domain name (or CDN host name)
     * If not use CDN or Domain, ipnut http://localhost.
     * If config.mode is s3 and empty this value (config.paths.domain_name), s3 use aws s3 public OBJECT URL
     */
    'domain_name': 'http://yourdomain-name' ,  // your Domain name
    /**
     * no image file path
     */
    'noimage': '/noimage.png',
    /**
     * prefix upload path
     */
    'upload_path': '/uploads'
  }
};
```
<br>

#### aws s3 mode

```js
module.exports = {
  /**
   * If you use aws s3, you should input your aws configure and s3_bucket name
   * Configuring the AWS CLI : https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html
   **/
  'awsconfig': {
    'region': 'us-west-2',
    'accessKeyId': 'AKIAIOSFODNN7EXAMPLE',
    'secretAccessKey': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    's3_bucket': 'your_bucket_name'
  },
  /**
   * HTTP Response Status Code
   * default : 302
   */
  'httpResponseStatusCode': 302,
  /**
   * Select mode 'local' or 's3'.
   * It means the upload target server. default 'local'
   */
  'mode': 's3',
  /**
   * node-image-proxy server's default port
   */
  'port': 3000,
  /**
   * Redis Server Information
   * default :
   *   'host': '127.0.0.1',
   *   'port': 6379,
   *   'db': 0
   */
  'redisServer': {
    'host': '127.0.0.1',
    'port': 6379,
    'db': 0
  },
  'paths':{
    /**
     * Your Domain name (or CDN host name)
     * If not use CDN or Domain, ipnut http://localhost.
     * If config.mode is s3 and empty this value (config.paths.domain_name), s3 use aws s3 public OBJECT URL
     */
    'domain_name': 'http://yourdomain-name' ,  // your Domain name
    /**
     * no image file path
     */
    'noimage': '/noimage.png',
    /**
     * prefix upload path
     */
    'upload_path': '/uploads'
  }
};
```
<br>

#### Permission

Be sure to use the `permission` option. Security is always important.
It prevents attackers of bad intentions.

```js
module.exports = {

  ...

  /**
   * An entry for the option to grant permission.
   * Only the options allowed here are available.
   * If you do not enter anything in the each options, all are allowed by default.
   *
   */
  'permission': {
    /**
     * Input all the allowed remote URL's hostnames. If there is no data, allow all remote URL. It is weak security.
     * ex) www.example.com
     */
    allowTargetHosts: [
      // 'www.example.com'
    ],
    /**
     * If you want, only accessible for certain hosts in the HTTP referrer header
     * ex) www.example.com
     */
    allowReferrers: [
      // 'www.example.com'
    ],
    /**
     * allowed options
     */
    allowOptions: {
      // allowed wh's number
      wh: [
        100, 200, 300
      ],
      // allowed resize's height
      h: [
        100, 200, 300
      ],
      // aloowed resize's width
      w: [
        100, 200, 300
      ],
      // allowed rotate's angle
      r: [
        90, 180, 270
      ],
      // allowed output format
      format: [
        'png', 'webp', 'jpg', 'jpeg'
      ],
      // allowed ohter option
      others: [
        'flip', 'flop', 'grey', 'gray', 'greyscale', 'grayscale'
      ]
    },
    /**
     * Allowed Mime Types of Remote URL's image.
     * default :
     *  'image/jpeg',
     *  'image/png',
     *  'image/gif'
     */
    'allowMimetypes': [
      'image/jpeg',
      'image/png',
      'image/gif'
    ],
    /**
     * allowed complex options.
     */
    allowComplex: [
      'resize',
      'composite',
      'flip',
      'flop',
      'grayscale'
    ],
    /**
      * Allowed Max Content Length
      * default : 20000000 (about 20MB)
      */
    'allowMaxContentLength': 20000000,
  },

  ...
}
```

<br>

## Benchmark

- Test Flatform : AWS `t2.micro` (Amazon Linux AMI 2018.03.0.20181129 x86_64 HVM)
- Test Option : w200,h300
- Test Image : JPEG 4,022,495 bytes (4 MB) 3264 * 2448
```
#1 After the image is first converted, the URL stores the cache in redis. (Return cache of redis for same request)

Time taken for tests:   4.734 seconds / 1000 requests
Requests per second:    211.24 [#/sec] (mean)
Time per request:       4.734 [ms] (mean)

#2 Cached

Time taken for tests:   1.238 seconds / 1000 requests
Requests per second:    807.68 [#/sec] (mean)
Time per request:       1.238 [ms] (mean)

#3 Cached

Time taken for tests:   1.193 seconds / 1000 requests
Requests per second:    838.42 [#/sec] (mean)
Time per request:       1.193 [ms] (mean)
```

- Test Option : w200,h300
- Test Image : JEPG 1,029,025 bytes (1 MB) 2448 * 3264
```
#1 After the image is first converted, the URL stores the cache in redis. (Return cache of redis for same request)

Time taken for tests:   4.090 seconds / 1000 requests
Requests per second:    244.48 [#/sec] (mean)
Time per request:       4.090 [ms] (mean)

#2 Cached

Time taken for tests:   1.272 seconds / 1000 requests
Requests per second:    786.36 [#/sec] (mean)
Time per request:       1.272 [ms] (mean)

#3 Cached

Time taken for tests:   1.198 seconds / 1000 requests
Requests per second:    834.85 [#/sec] (mean)
Time per request:       1.198 [ms] (mean)
```
<br>

## License

MIT
