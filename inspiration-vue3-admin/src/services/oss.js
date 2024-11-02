// 阿里云的 OSS 静态资源上传封装，图片上传用到。
import request from '@/utils/request.js';
import API from '@/consts/api.js';
import OSS from 'ali-oss';


const ossService = {
  /**
   * 上传单个文件
   */
  upload: async (
    { file, title = null, bucket = null, space = null, folder = null },
    callback,
    error,
    end,
    storecallback
  ) => {
    const ossParams = await ossService
      .token({
        file_name: file.name,
        bucket,
        space,
        folder
      })
      .catch((err) => {
        console.log(err);
        end && end();
      });
    console.log('ossParams', ossParams);

    const uploadRes = await ossService.put(file, ossParams).catch((err) => error && error(err));
    console.log('uploadRes', uploadRes);
    // 获取图片长宽信息
    const imageRes = await ossService.get(file, ossParams).catch((err) => error && error(err));
    const infoString = new TextDecoder().decode(imageRes.content)
    const imageInfo = JSON.parse(infoString)

    callback(uploadRes);
    callback(imageRes);
    end && end();

    const storeRes = await ossService
      .storeCallback({
        file_name: space,
        path: ossParams.data.key,
        bucket: ossParams.data.bucket,
        title,
        image_width: imageInfo.ImageWidth,
        image_height: imageInfo.ImageHeight
      })
      .catch((err) => error && error(err));
    storecallback && storecallback(storeRes);
    console.log('storeRes', storeRes);

  },
  /**
   *  获取token授权
   *  'file_name' => 'required|string', // 文件名
      'bucket' => 'string', // bucket名
      'space' => 'string', // 空间名，例如avatar
      'folder' => 'string' // 文件夹名
   */
  token: (params = {}) => {
    return request.post(API.ossToken, params);
  },

  put: (file, params) => {
    // 后端传过来的数据中data字段中包含下面信息
    const { region, accessKeyId, accessKeySecret, stsToken, bucket, key } = params.data;
    console.log('params', params);
    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      stsToken,
      bucket,
      timeout: 1800000
    });
    return client.put(key, file);
  },

  // 获取图片的长和宽参数
  get: (file, params) => {
    // 后端传过来的数据中data字段中包含下面信息
    const { region, accessKeyId, accessKeySecret, stsToken, bucket, key } = params.data;
    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      stsToken,
      bucket,
      timeout: 1800000
    });
    return client.get(key, { process: 'image/info' })
  },

  /**
   *  上传成功后回调
   *  'file_name' => 'required|string', // 文件类型，例如avatar
      'path'      => 'required|string', // token返回的bucket存储位置
      'bucket'    => 'required|string', // bucket名
      'title'      => 'string' // 文件展示名称
   */
  storeCallback: (params) => {
    return request.post(API.ossStore, params);
  }
};

export default ossService;
