const line = require("@line/bot-sdk");
const User = require("../models/user.model");
const Round = require("../models/round.model");

const { channelAccessToken } = require("../../config/vars");

const client = new line.Client({ channelAccessToken });

exports.LineBot = async (req, res) => {
  try {
    const { destination, events } = req.body;
    // console.log('destination: ', destination);
    const {
      type,
      message,
      webhookEventId,
      deliveryContext,
      timestamp,
      source,
      replyToken,
      mode,
    } = events[0];
    const { userId, groupId } = source;
    console.log("events[0]: ", events[0]);
    // console.log('events[0]: ', events[0]);
    // console.log('type: ', type);
    // console.log('message: ', message);
    // console.log('webhookEventId: ', webhookEventId);
    // console.log('deliveryContext: ', deliveryContext);
    // console.log('timestamp: ', timestamp);
    // console.log('source: ', source);
    // console.log('replyToken: ', replyToken);
    // console.log('mode: ', mode);
    // console.log('< ============================== >');
    // console.log('userId: ', userId);
    // console.log('groupId: ', groupId);

    let returnMessage;
    switch (message.text) {
      case "@u" || "@U": {
        const profile = await client.getProfile(source.userId);
        const user = await User.findOne({ groupId, userId: profile.userId }).lean();
        console.log("user =>", user);
        if (user) {
          return replyMessage(replyToken, {
            type: "text",
            text: `คุณ ${profile.displayName} เป็นสมาชิกแล้วค่ะ`,
          });
        }
        let { id } = (await User.findOne({ groupId })
          .select("-_id id")
          .sort({ id: -1 })) ?? { id: 0 };
        id += 1;
        await User.updateOne(
          { userId: profile.userId },
          {
            userId: profile.userId,
            username: profile.displayName,
            groupId,
            id,
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
        replyMessage(replyToken, {
          type: "flex",
          altText: "this is a flex message",
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "ยินดีต้อนรับ 🎉🎉",
                  size: "18px",
                  weight: "bold",
                },
              ],
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  contents: [
                    {
                      type: "text",
                      text: "คุณ",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: `${profile.displayName}`,
                      flex: 4,
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "baseline",
                  contents: [
                    {
                      type: "text",
                      text: "🆔",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: `${id}`,
                      flex: 4,
                    },
                  ],
                },
                {
                  type: "text",
                  text: "ขอให้เพลิดเพลินกับการเล่นนะคะ 🎊 🎉",
                  wrap: true,
                  margin: "xxl",
                },
              ],
            },
            styles: {
              header: {
                backgroundColor: "#35E267",
              },
            },
          },
        });
        break;
      }
      case "กต": {
        returnMessage = {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6",
        };
        replyMessage(replyToken, returnMessage);
        break;
      }
      case "ว": {
        returnMessage = {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a",
        };
        replyMessage(replyToken, returnMessage);
        break;
      }
      default: {
        const profile = await client.getProfile(source.userId);
        const user = await User.findOne({ userId: profile.userId }).lean();
        roleSwitch(events[0], profile, user);
        break;
      }
    }
  } catch (e) {
    console.log("------------------------------------------");
    console.log("line lib err ====>", e);
    console.log("------------------------------------------");
  }
};

const replyMessage = async (replyToken, message) => {
  try {
    await client.replyMessage(replyToken, message);
    console.log("replyMessage Success");
  } catch (e) {
    console.log("replyMessage e =>", e);
  }
};

const roleSwitch = (event, profile, user) => {
  if (["MEMBER"].includes(user.role)) {
    return memberCommand(event, profile, user);
  }
  if (["ADMIN"].includes(user.role)) {
    return adminCommand(event, profile, user);
  }
};

const memberCommand = async (event, profile, user) => {
  console.log("Role: Member");
  const {
    type,
    message,
    webhookEventId,
    deliveryContext,
    timestamp,
    source,
    replyToken,
    mode,
  } = event;
  console.log("profile: ", profile);
  console.log("event: ", event);
  if (message.type === "image") {
    const txt = {
      type: "flex",
      altText: "this is a flex message",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `💫 คุณ ${profile.displayName} [ID : ${user.id}] 💫`,
            },
            {
              type: "text",
              text: "ได้ส่งสลิปการโอนเงิน 📩",
            },
            {
              type: "text",
              text: `เครดิตปัจจุบัน ${user.wallet.balance} ฿ 💰`,
            },
            {
              type: "text",
              text: "รอแอดมินดำเนินการสักครู่นะคะ 🫶",
            },
          ],
        },
      },
    };
    replyMessage(replyToken, txt);
  } else {
    const command = message.text.toLowerCase();
    switch (command) {
      case "ต":
        message = [
          {
            type: "image",
            originalContentUrl:
              "https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz",
            previewImageUrl:
              "https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz",
          },
          {
            type: "image",
            originalContentUrl:
              "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
            previewImageUrl:
              "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
          },
        ];
        break;
    }
  }
};

const adminCommand = async (event, profile, user) => {
  console.log("event: ", event);
  console.log("Role: Admin");
  const {
    type,
    message,
    webhookEventId,
    deliveryContext,
    timestamp,
    source,
    replyToken,
    mode,
  } = event;
  const { groupId, userId } = source;
  console.log("profile: ", profile);
  console.log("event: ", event);
  console.log("userProfile: ", user);
  const command = message.text.toLowerCase();
  console.log("command: ", command);
  if (command.startsWith('s')) {
    // TODO game logic
    return
  }
  switch (command) {
    case "o": {
      const round = await Round.findOne({ groupId })
        .sort({ roundId: -1, _id: -1 })
        .lean();
      if (round && round.roundStatus === "OPEN") {
        return replyMessage(replyToken, {
          type: "text",
          text: `ขณะนี้อยู่ในรอบที่ ${round.roundId} `,
        });
      }
      const roundId = round ? round.id + 1 : 1;
      new Round({
        roundId,
        groupId,
        createdByUsername: profile.displayName,
        createdByUserId: userId,
      }).save();
      replyMessage(replyToken, [
        {
          type: "text",
          text: `=== รอบที่ ${roundId} ===`,
        },
        {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96",
        },
      ]);
      break;
    }
    case "f": {
      const round = await Round.findOneAndUpdate({
          groupId,
          roundStatus: "OPEN",
        }, {
          roundStatus: "CLOSE",
          updatedDate: new Date(),
        })
        .sort({ roundId: -1, _id: -1 })
        .lean();
      if (!round) {
        return replyMessage(replyToken, {
            type: "text",
            text: `ขณะนี้ไม่มีรอบที่เปิดอยู่`,
          })
      }
      replyMessage(replyToken, [
        {
          type: "text",
          text: `=== ปิดรอบที่ ${round.id} ===`,
        },
        {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK",
        },
      ]);
      break;
    }
  }
};

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
//             'type': 'flex',
//             'altText': 'this is a flex message',
//             'contents': {
//               'type': 'bubble',
//               'header': {
//                 'type': 'box',
//                 'layout': 'vertical',
//                 'contents': [
//                   {
//                     'type': 'text',
//                     'text': 'ยินดีต้อนรับ 🎉🎉',
//                     'size': '18px',
//                     'weight': 'bold'
//                   }
//                 ]
//               },
//               'body': {
//                 'type': 'box',
//                 'layout': 'vertical',
//                 'contents': [
//                   {
//                     'type': 'box',
//                     'layout': 'baseline',
//                     'contents': [
//                       {
//                         'type': 'text',
//                         'text': 'คุณ',
//                         'flex': 1
//                       },
//                       {
//                         'type': 'text',
//                         'text': `${profile.displayName}`,
//                         'flex': 4
//                       }
//                     ]
//                   },
//                   {
//                     'type': 'box',
//                     'layout': 'baseline',
//                     'contents': [
//                       {
//                         'type': 'text',
//                         'text': '🆔',
//                         'flex': 1
//                       },
//                       {
//                         'type': 'text',
//                         'text': `${user}`,
//                         'flex': 4
//                       }
//                     ]
//                   },
//                   {
//                     'type': 'text',
//                     'text': 'ขอให้เพลิดเพลินกับการแทงหวยยี่กี่ค่ะ 🎊 🎉',
//                     'wrap': true,
//                     'margin': 'xxl'
//                   }
//                 ]
//               },
//               'styles': {
//                 'header': {
//                   'backgroundColor': '#35E267'
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
//           'type': 'flex',
//           'altText': 'this is a flex message',
//           'contents': {
//             'type': 'bubble',
//             'body': {
//               'type': 'box',
//               'layout': 'horizontal',
//               'contents': [
//                 {
//                   'type': 'text',
//                   'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//                   'wrap': true,
//                   'color': '#ff0000',
//                   'flex': 2
//                 },
//                 {
//                   'type': 'text',
//                   'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//                   'wrap': true,
//                   'color': '#0000ff',
//                   'flex': 3
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
