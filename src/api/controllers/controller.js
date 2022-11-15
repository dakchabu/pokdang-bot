const line = require('@line/bot-sdk');
const User = require('../models/user.model');
const Round = require('../models/round.model');

const { channelAccessToken } = require('../../config/vars')

const client = new line.Client({ channelAccessToken })

let commandText = '';
let userId = '';
let replyToken = '';
let message

exports.test = async (req, res) => {
  const users = await User.find({}).lean()
  console.log('users =>', users)
  return res.json({ message: 'CONNECT ROUTE AND CONTROLLER!' })
}

exports.LineBot = (req, res) => {
  try {
    console.log('req', req.body)
    console.log('req.body.events[0]', req.body.events[0]);
    commandText = req.body.events[0].message.text;
    console.log("commandText: ", commandText);
    userId = req.body.events[0].source.userId;
    console.log("userId: ", userId);
    replyToken = req.body.events[0].replyToken;
    console.log("replyToken: ", replyToken);
    groupId = req.body.events[0].source.groupId;
    console.log("groupId: ", groupId);

    client.getProfile(userId)
      .then(async (profile) => {
        console.log("profile: ", profile);
        const getRole = await User.findOne({ refUsername: profile.userId }).select('role').lean()
        console.log(profile.displayName);
        console.log(profile.userId);
        console.log(profile.pictureUrl);
        console.log(profile.statusMessage);
        if (getRole) {
          findCase(profile, getRole.role);
        } else {
          findCase(profile, 'member');
        }
        return profile
      })
      .catch((err) => {
        console.log('err', err);
      });
  } catch (e) {
    console.log(e)
  }
}

const findCase = async (profile, role) => {
  switch (commandText.toUpperCase().slice(0, 1) || commandText.toUpperCase()) {
    case 'O':
      if (['ADMIN'].includes(role)) {
        const round = await Round.findOne().lean();
        if (!round.roundStatus) {
          message = [
            {
              type: 'text',
              text: `=== รอบที่ ${round.round + 1} ===`
            },
            {
              type: 'image',
              originalContentUrl: 'https://www.img.in.th/images/925509976877d27bd42494092528d778.png',
              previewImageUrl: 'https://www.img.in.th/images/925509976877d27bd42494092528d778.png'
            }
          ];
          let setRound = round.round + 1;
          await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { round: setRound, roundStatus: true }, { upsert: true, new: true })
        } else {
          message = {
            type: 'text',
            text: `รอบที่ ${round.round} เริ่มไปแล้วค่ะ`
          }
        }
      } else {
        message = {
          type: 'text',
          text: `${profile.displayName} ไม่สามารถทำรายการได้ค่ะ`
        }
      }
      replyMessage(replyToken, message);
      break;
    case 'F':
      if (['ADMIN'].includes(role)) {
        const round = await Round.findOne().lean();
        if (round.roundStatus) {
          message = [
            {
              type: 'text',
              text: `=== ปิดรอบที่ ${round.round} ===`
            },
            {
              type: 'image',
              originalContentUrl: 'https://www.img.in.th/images/af9f924ac331e4c29582173ef1a1b43c.png',
              previewImageUrl: 'https://www.img.in.th/images/af9f924ac331e4c29582173ef1a1b43c.png'
            }
          ]
          await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { roundStatus: false }, { upsert: true, new: true })
        } else {
          message = {
            type: 'text',
            text: `ยังไม่ได้ทำการเปิดรอบค่ะ`
          }
        }
      } else {
        message = {
          type: 'text',
          text: `${profile.displayName} ไม่สามารถทำรายการได้ค่ะ`
        }
      }
      break
    case '@':
      if (commandText.toLowerCase() === '@u') {
        console.log('Add user');
        const user = await registerUser(profile)
        if (user) {
          // message = {
          //   type: 'text',
          //   text: `ยินดีต้อนรับคุณ ${profile.displayName} ID: ${user} เครดิตคงเหลือ`
          // };
          message = {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "ยินดีต้อนรับ 🎉🎉",
                    "size": "18px",
                    "weight": "bold"
                  }
                ]
              },
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "คุณ",
                        "flex": 1
                      },
                      {
                        "type": "text",
                        "text": `${profile.displayName}`,
                        "flex": 4
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "🆔",
                        "flex": 1
                      },
                      {
                        "type": "text",
                        "text": `${user}`,
                        "flex": 4
                      }
                    ]
                  },
                  {
                    "type": "text",
                    "text": "ขอให้เพลิดเพลินกับการแทงหวยยี่กี่ค่ะ 🎊 🎉",
                    "wrap": true,
                    "margin": "xxl"
                  }
                ]
              },
              "styles": {
                "header": {
                  "backgroundColor": "#35E267"
                }
              }
            }
          }
        } else {
          message = {
            type: 'text',
            text: `คุณ ${profile.displayName} มี ID แล้วค่ะ`
          };
        }
      }
      break;
    case '$':
      let totalBalance = 0
      if (['ADMIN'].includes(role)) {
        if (commandText.includes('+')) {
          console.log('refill');
          const idRefill = commandText.split('+', 2);
          const id = idRefill[0].replace('$', '');
          const refill = idRefill[1];
          await refillCredit(id, refill)
          totalBalance = await getUserBalance(id)
          message = {
            type: 'text',
            text: `เติมเครดิต ID:${id} เครดิต${refill} เครดิตคงเหลือ ${totalBalance} โดย ADMIN ${profile.displayName}`
          };
        }
        if (commandText.includes('-')) {
          const idDeduct = commandText.split('-', 2);
          const id = idDeduct[0].replace('$', '');
          const deduct = idDeduct[1];
          await deductCredit(id, deduct)
          totalBalance = await getUserBalance(id)
          message = {
            type: 'text',
            text: `ลบเครดิต ID:${id} เครดิต${deduct} เครดิตคงเหลือ ${totalBalance} โดย ADMIN ${profile.displayName}`
          };
        }
      }
      break;
    case 'ก':
      if (commandText === 'กต') {
        message = [
          {
            type: 'image',
            originalContentUrl: 'https://www.img.in.th/images/940bd1d7cc8a74594078f91bbb1c5614.png',
            previewImageUrl: 'https://www.img.in.th/images/940bd1d7cc8a74594078f91bbb1c5614.png'
          },
          {
            type: 'image',
            originalContentUrl: 'https://www.img.in.th/images/dfb30bb9304e5412731dbe6b5a854dcc.png',
            previewImageUrl: 'https://www.img.in.th/images/dfb30bb9304e5412731dbe6b5a854dcc.png'
          }
        ]
      }
      break
    case 'C':
      if (commandText.toUpperCase() == 'CC') {
        message = {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                  "wrap": true,
                  "color": "#ff0000",
                  "flex": 2
                },
                {
                  "type": "text",
                  "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                  "wrap": true,
                  "color": "#0000ff",
                  "flex": 3
                }
              ]
            }
          }
        }
      }
    case 'C':
      if (commandText.toUpperCase() === 'CR') {
        if (['ADMIN'].includes(role)) {
          await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { round: 0, roundStatus: false }, { upsert: true, new: true })
          message = {
            type: 'text',
            text: `ดำเนินการเคลียรอบโดย ${profile.displayName} เรียบร้อยแล้วค่ะ`
          };
        }
      }
      break
  }
  console.log('mes', JSON.stringify(message))
  replyMessage(replyToken, message);
  return profile
}

const replyMessage = (replyToken, message) => {
  client.replyMessage(replyToken, message)
    .then(() => {
      console.log('nice')
    })
    .catch((err) => {
      console.log('line api err', err)
    });
};

const registerUser = async (profile) => {
  const checkUserDuplicate = await User.find({ refUsername: profile.userId }).lean();
  if (!checkUserDuplicate.length) {
    const userlength = await User.find().lean();
    const userId = userlength.length;
    const param = {
      userId: userId + 1,
      username: profile.displayName,
      refUsername: profile.userId,
    }
    new User(param).save();
    return param.userId
  }
}

const refillCredit = async (id, refill) => {
  try {
    let updatebalance = await getUserBalance(id)
    updatebalance = (updatebalance + Number(refill))
    await User.updateOne({ userId: id }, { balance: updatebalance })
    return refill
  } catch (e) {
    console.log('e', e);
  }
};

const deductCredit = async (id, deduct) => {
  try {
    let updatebalance = await getUserBalance(id)
    updatebalance = (updatebalance - Number(deduct))
    await User.updateOne({ userId: id }, { balance: updatebalance })
    return deduct
  } catch (e) {
    console.log('err', e)
  }
};

const getUserBalance = async (id) => {
  try {
    const user = await User.findOne({ userId: id }).lean()
    return Number(user.balance.toString())
  } catch (e) {
    console.log('err', e)
  }
}