const line = require('@line/bot-sdk');
const User = require('../models/user.model');
const Round = require('../models/round.model');

const { channelAccessToken } = require('../../config/vars');

const client = new line.Client({ channelAccessToken });

exports.LineBot = (req, res) => {
  try {
    const { destination, events } = req.body;
    // console.log("destination: ", destination);
    const { type, message, webhookEventId, deliveryContext, timestamp, source, replyToken, mode}  = events[0];
    // console.log("events[0]: ", events[0]);
    // console.log("type: ", type);
    // console.log("message: ", message);
    // console.log("webhookEventId: ", webhookEventId);
    // console.log("deliveryContext: ", deliveryContext);
    // console.log("timestamp: ", timestamp);
    // console.log("source: ", source);
    // console.log("replyToken: ", replyToken);
    // console.log("mode: ", mode);
    // console.log('< ============================== >');
    const userId = source.userId;
    // console.log("userId: ", userId);
    const groupId = source.groupId;
    // console.log("groupId: ", groupId);

    let returnMessage;
    const commandText = message.text.toLowerCase();
    switch(commandText) {
      case '@u' :
        returnMessage = {
          type: 'text',
          text: `Register Member`
        }
        replyMessage(replyToken, returnMessage);
        break
      case 'กต' :
        returnMessage = {
          type: 'image',
          originalContentUrl: 'https://sv1.picz.in.th/images/2022/11/19/GflEXl.png',
          previewImageUrl: 'https://sv1.picz.in.th/images/2022/11/19/GflEXl.png'
        }
        replyMessage(replyToken, returnMessage);
        break
      case 'ว' :
        returnMessage = {
          type: 'image',
          originalContentUrl: 'https://sv1.picz.in.th/images/2022/11/19/Gflbzk.png',
          previewImageUrl: 'https://sv1.picz.in.th/images/2022/11/19/Gflbzk.png'
        }
        replyMessage(replyToken, returnMessage);
        break
      default :
        client.getProfile(source.userId)
          .then(async (profile) => {
            // console.log('< -------------------------------------------------- >');
            // console.log('< -------------------------------------------------- >');
            // console.log("profile: ", profile);
            // console.log("profile.displayName: ", profile.displayName);
            // console.log("profile.userId: ", profile.userId);
            // console.log("profile.pictureUrl: ", profile.pictureUrl);
            // console.log("profile.statusMessage: ", profile.statusMessage);
            // console.log('< -------------------------------------------------- >');
            // console.log('< -------------------------------------------------- >');
            roleSwitch(events[0], profile);
          })
          .catch((err) => {
            console.log('err', err);
          });
        break
      }
  } catch (e) {
    console.log('---------------------');
    console.log('line lib err ====>', e);
    console.log('---------------------');
  }
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

const roleSwitch = (event, profile) => {
  const role = 'MEMBER';
  if(['MEMBER'].includes(role)) {
    console.log('is MEMBER');
    memberCommand(event, profile);
  } else if(['ADMIN'].includes(role)) {
    console.log('is ADMIN');
    adminCommand(event, profile);
  }
}

const memberCommand = (event, profile) => {
  const { type, message, webhookEventId, deliveryContext, timestamp, source, replyToken, mode}  = event;
  console.log("profile: ", profile);
  console.log("event: ", event);
  if(message.type === 'image') {
    const txt = {
      'type': 'flex',
      'altText': 'this is a flex message',
      'contents': {
        'type': 'bubble',
        'body': {
          'type': 'box',
          'layout': 'vertical',
          'contents': [
            {
              'type': 'text',
              'text': `💫 คุณ [line Name] [ID : ID] 💫`
            },
            {
              'type': 'text',
              'text': 'ได้ส่งสลิปการโอนเงิน 📩'
            },
            {
              'type': 'text',
              'text': 'เครดิตปัจจุบัน [credit] ฿ 💰'
            },
            {
              'type': 'text',
              'text': 'รอแอดมินดำเนินการสักครู่นะค่ะ 🫶'
            }
          ]
        }
      }
    }
    replyMessage(replyToken, txt);
  } else {
    const command = message.text.toLowerCase();
    console.log("command: ", command);
    switch(message.text) {
      case '' :
        break
    }
  }
}

const adminCommand = (event, profile) => {
  const { type, message, webhookEventId, deliveryContext, timestamp, source, replyToken, mode}  = events[0];
  console.log("profile: ", profile);
  console.log("event: ", event);
}

// const findCase = async (profile, role) => {
//   switch (commandText.toUpperCase().slice(0, 1) || commandText.toUpperCase()) {
//     case 'O':
//       if (['ADMIN'].includes(role)) {
//         const round = await Round.findOne().lean();
//         if (!round.roundStatus) {
//           message = [
//             {
//               type: 'text',
//               text: `=== รอบที่ ${round.round + 1} ===`
//             },
//             {
//               type: 'image',
//               originalContentUrl: 'https://www.img.in.th/images/925509976877d27bd42494092528d778.png',
//               previewImageUrl: 'https://www.img.in.th/images/925509976877d27bd42494092528d778.png'
//             }
//           ];
//           let setRound = round.round + 1;
//           await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { round: setRound, roundStatus: true }, { upsert: true, new: true })
//         } else {
//           message = {
//             type: 'text',
//             text: `รอบที่ ${round.round} เริ่มไปแล้วค่ะ`
//           }
//         }
//       } else {
//         message = {
//           type: 'text',
//           text: `${profile.displayName} ไม่สามารถทำรายการได้ค่ะ`
//         }
//       }
//       replyMessage(replyToken, message);
//       break;
//     case 'F':
//       if (['ADMIN'].includes(role)) {
//         const round = await Round.findOne().lean();
//         if (round.roundStatus) {
//           message = [
//             {
//               type: 'text',
//               text: `=== ปิดรอบที่ ${round.round} ===`
//             },
//             {
//               type: 'image',
//               originalContentUrl: 'https://www.img.in.th/images/af9f924ac331e4c29582173ef1a1b43c.png',
//               previewImageUrl: 'https://www.img.in.th/images/af9f924ac331e4c29582173ef1a1b43c.png'
//             }
//           ]
//           await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { roundStatus: false }, { upsert: true, new: true })
//         } else {
//           message = {
//             type: 'text',
//             text: `ยังไม่ได้ทำการเปิดรอบค่ะ`
//           }
//         }
//       } else {
//         message = {
//           type: 'text',
//           text: `${profile.displayName} ไม่สามารถทำรายการได้ค่ะ`
//         }
//       }
//       break
//     case '@':
//       if (commandText.toLowerCase() === '@u') {
//         console.log('Add user');
//         const user = await registerUser(profile)
//         if (user) {
//           // message = {
//           //   type: 'text',
//           //   text: `ยินดีต้อนรับคุณ ${profile.displayName} ID: ${user} เครดิตคงเหลือ`
//           // };
//           message = {
//             "type": "flex",
//             "altText": "this is a flex message",
//             "contents": {
//               "type": "bubble",
//               "header": {
//                 "type": "box",
//                 "layout": "vertical",
//                 "contents": [
//                   {
//                     "type": "text",
//                     "text": "ยินดีต้อนรับ 🎉🎉",
//                     "size": "18px",
//                     "weight": "bold"
//                   }
//                 ]
//               },
//               "body": {
//                 "type": "box",
//                 "layout": "vertical",
//                 "contents": [
//                   {
//                     "type": "box",
//                     "layout": "baseline",
//                     "contents": [
//                       {
//                         "type": "text",
//                         "text": "คุณ",
//                         "flex": 1
//                       },
//                       {
//                         "type": "text",
//                         "text": `${profile.displayName}`,
//                         "flex": 4
//                       }
//                     ]
//                   },
//                   {
//                     "type": "box",
//                     "layout": "baseline",
//                     "contents": [
//                       {
//                         "type": "text",
//                         "text": "🆔",
//                         "flex": 1
//                       },
//                       {
//                         "type": "text",
//                         "text": `${user}`,
//                         "flex": 4
//                       }
//                     ]
//                   },
//                   {
//                     "type": "text",
//                     "text": "ขอให้เพลิดเพลินกับการแทงหวยยี่กี่ค่ะ 🎊 🎉",
//                     "wrap": true,
//                     "margin": "xxl"
//                   }
//                 ]
//               },
//               "styles": {
//                 "header": {
//                   "backgroundColor": "#35E267"
//                 }
//               }
//             }
//           }
//         } else {
//           message = {
//             type: 'text',
//             text: `คุณ ${profile.displayName} มี ID แล้วค่ะ`
//           };
//         }
//       }
//       break;
//     case '$':
//       let totalBalance = 0
//       if (['ADMIN'].includes(role)) {
//         if (commandText.includes('+')) {
//           console.log('refill');
//           const idRefill = commandText.split('+', 2);
//           const id = idRefill[0].replace('$', '');
//           const refill = idRefill[1];
//           await refillCredit(id, refill)
//           totalBalance = await getUserBalance(id)
//           message = {
//             type: 'text',
//             text: `เติมเครดิต ID:${id} เครดิต${refill} เครดิตคงเหลือ ${totalBalance} โดย ADMIN ${profile.displayName}`
//           };
//         }
//         if (commandText.includes('-')) {
//           const idDeduct = commandText.split('-', 2);
//           const id = idDeduct[0].replace('$', '');
//           const deduct = idDeduct[1];
//           await deductCredit(id, deduct)
//           totalBalance = await getUserBalance(id)
//           message = {
//             type: 'text',
//             text: `ลบเครดิต ID:${id} เครดิต${deduct} เครดิตคงเหลือ ${totalBalance} โดย ADMIN ${profile.displayName}`
//           };
//         }
//       }
//       break;
//     case 'ก':
//       if (commandText === 'กต') {
//         message = [
//           {
//             type: 'image',
//             originalContentUrl: 'https://www.img.in.th/images/940bd1d7cc8a74594078f91bbb1c5614.png',
//             previewImageUrl: 'https://www.img.in.th/images/940bd1d7cc8a74594078f91bbb1c5614.png'
//           },
//           {
//             type: 'image',
//             originalContentUrl: 'https://www.img.in.th/images/dfb30bb9304e5412731dbe6b5a854dcc.png',
//             previewImageUrl: 'https://www.img.in.th/images/dfb30bb9304e5412731dbe6b5a854dcc.png'
//           }
//         ]
//       }
//       break
//     case 'C':
//       if (commandText.toUpperCase() == 'CC') {
//         message = {
//           "type": "flex",
//           "altText": "this is a flex message",
//           "contents": {
//             "type": "bubble",
//             "body": {
//               "type": "box",
//               "layout": "horizontal",
//               "contents": [
//                 {
//                   "type": "text",
//                   "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//                   "wrap": true,
//                   "color": "#ff0000",
//                   "flex": 2
//                 },
//                 {
//                   "type": "text",
//                   "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//                   "wrap": true,
//                   "color": "#0000ff",
//                   "flex": 3
//                 }
//               ]
//             }
//           }
//         }
//       }
//     case 'C':
//       if (commandText.toUpperCase() === 'CR') {
//         if (['ADMIN'].includes(role)) {
//           await Round.updateOne({ _id: '6152aba71d76b1f50c411bed' }, { round: 0, roundStatus: false }, { upsert: true, new: true })
//           message = {
//             type: 'text',
//             text: `ดำเนินการเคลียรอบโดย ${profile.displayName} เรียบร้อยแล้วค่ะ`
//           };
//         }
//       }
//       break
//   }
//   console.log('mes', JSON.stringify(message))
//   replyMessage(replyToken, message);
//   return profile
// }