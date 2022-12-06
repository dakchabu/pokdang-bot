const { default: axios } = require("axios")
const { lineNotifyToken, lineNotifyURL } = require("../config/vars")

exports.lineNotify = async (data) => {
  await axios.post(encodeURI(`${lineNotifyURL}?message=${data}`), {}, {
    headers: { 'Authorization': `Bearer ${lineNotifyToken}` }
  })
}
