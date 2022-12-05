const { default: axios } = require("axios")
const { lineNotifyToken, lineNotifyURL } = require("../config/vars")

exports.linenotify = async (data) => {
  await axios.post(`${lineNotifyURL}?message=${data}`, {}, {
    headers: { 'Authorization': `Bearer ${lineNotifyToken}` }
  })
}
