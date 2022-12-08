const { default: axios } = require("axios")
const { lineNotifyURL } = require("../config/vars")

exports.lineNotify = async (data, token) => {
  await axios.post(encodeURI(`${lineNotifyURL}?message=${data}`), {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}
