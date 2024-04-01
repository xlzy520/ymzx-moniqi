const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

/**
 *
 * @param {*} key 企业微信机器人推送的key
 * @returns 配置信息
 */
const getConfig = (key) => {
  const hookKey =
    key ||
    process.env?.WECHAT_WEBHOOK_KEY ||
    "c82aaefb-7bc8-479e-bbb3-3288c5aeb250";
  if (typeof hookKey !== "string" && !hookKey)
    throw new Error(`${hookKey} must be string , no empty`);
  return {
    key: hookKey,
    url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${hookKey}`,
    uploadURL: `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${hookKey}&type=file`,
  };
};

/**
 * 上传文件到企业微信
 * @param {string} filename 上传的文件
 * @return Promise<response>
 *
 * response:
 * ```
 * {
 *   errcode: 0,
 *   errmsg: 'ok',
 *   type: 'file',
 *   media_id: '3-txPJzsW5L5IMXDcQjlcp5OxUenF_YB_ib8zRJwE4AgEVb97RbjG-PtF-pjP42jk',
 *   created_at: '1662452066'
 * }
 * ```https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=
 */
function uploadFileToEnterpriseWeChat(filename) {
  const url = getConfig().uploadURL;
  const normalizePath = (value) => {
    return value.replaceAll("\\", "/");
  };
  const normalizeFilename = normalizePath(filename);
  const readStream = fs.createReadStream(normalizeFilename);
  // 上传文件使用FormData
  // nodejs里使用FormData：https://github.com/form-data/form-data
  const formData = new FormData();
  formData.append("media", readStream);
  return axios.post(url, formData).then((res) => {
    return res.status === 200 && res.data;
  });
}

/**
 * 发送文件到企业微信群
 * @param {string} media_id 通过上传接口获取的`media_id`
 */
function sendFileToEnterpriseWeChatGroup(media_id) {
  const url = getConfig().url;
  const data = {
    msgtype: "file",
    file: {
      media_id,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

/**
 *
 * @param {string} mdTpl markdown的字符串模板，仅生效特定子集
 * @see {@link https://developer.work.weixin.qq.com/document/path/91770#markdown%E7%B1%BB%E5%9E%8B | 企业微信机器人配置}
 * @returns
 */
function sendMarkdownTextToEnterpriseWeChatGroup(mdTpl = "") {
  const url = getConfig().url;
  const data = {
    msgtype: "markdown",
    markdown: {
      content: mdTpl,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

/**
 *
 * @param { string } text 普通文本的内容
 * @param {*} options
 * @param {string[]} options.mentioned_list userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人，如果开发者获取不到userid，可以使用mentioned_mobile_list
 * @param {string[]} options.mentioned_mobile_list 手机号列表，提醒手机号对应的群成员(@某个成员)，@all表示提醒所有人
 * @see {@link https://developer.work.weixin.qq.com/document/path/91770#%E6%96%87%E6%9C%AC%E7%B1%BB%E5%9E%8B | 企业微信机器人配置}
 * @returns
 */
function sendTextToEnterpriseWeChatGroup(text = "", options = {}) {
  const url = getConfig().url;
  const data = {
    msgtype: "text",
    text: {
      content: text,
      mentioned_mobile_list: ["@all"],
      ...options,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

async function weChatPush(file) {
  if (typeof file !== "string" && !file) {
    throw new Error("File " + file + " is not a valid file");
  }
  try {
    const { media_id } = await uploadFileToEnterpriseWeChat(file);
    // await sendImgToEnterpriseWeChatGroup();
    await sendFileToEnterpriseWeChatGroup(media_id);
  } catch (error) {
    console.log("%c 🍎 error", "color:#fca650", error);
  }
}

module.exports = {
  getConfig,
  uploadFileToEnterpriseWeChat,
  sendFileToEnterpriseWeChatGroup,
  weChatPush,
  // sendImgToEnterpriseWeChatGroup,
  // sendMarkdownTextToEnterpriseWeChatGroup,
  sendTextToEnterpriseWeChatGroup,
};
