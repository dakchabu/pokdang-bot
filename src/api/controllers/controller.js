const line = require("@line/bot-sdk");
const moment = require("moment");
const User = require("../models/user.model");
const Round = require("../models/round.model");
const BetTransaction = require("../models/betTransaction.model");
const { replyMessage } = require("../../service/replyMessage");

const { channelAccessToken } = require("../../config/vars");

const client = new line.Client({ channelAccessToken });
const betLimit = 2000;

exports.LineBot = async (req, res) => {
  try {
    const { destination, events } = req.body;
    console.log("events: ", events);
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
    switch (message.text) {
      case "@u": {
        const profile = await client.getGroupMemberProfile(groupId, userId);
        const user = await User.findOne({
          groupId,
          userId: profile.userId,
        }).lean();
        if (user)
          return replyMessage({
            client,
            replyToken,
            messageType: "MEMBER_EXISTS",
            profile,
          });
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
        replyMessage({
          client,
          replyToken,
          messageType: "MEMBER_REGISTER",
          profile,
          user,
          id,
        });
        break;
      }
      case "กต": {
        replyMessage({ client, replyToken, messageType: "RULES" });
        break;
      }
      case "ว": {
        replyMessage({ client, replyToken, messageType: "HOWTO" });
        break;
      }
      default: {
        const profile = await client.getGroupMemberProfile(groupId, userId);
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

const roleSwitch = (event, profile, user) => {
  if (["MEMBER"].includes(user.role)) {
    return memberCommand(event, profile, user);
  }
  if (["ADMIN"].includes(user.role)) {
    return adminCommand(event, profile, user);
  }
};

const memberCommand = async (event, profile, user) => {
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
  if (message.type === "image") {
    replyMessage({ client, replyToken, messageType: "RECEIVE_IMAGE", profile, user });
  } else if (message.type === "text") {
    const command = message.text.toLowerCase();
    const isC = command.startsWith("c");
    switch ((command, isC)) {
      // case 'c':
      //   let name = [];
      //   for (let i=0;i<100;i++) {
      //     name.push(
      //       {
      //         'type': 'text',
      //         'text': `${i+1}) นายสมพง`
      //       }
      //     )
      //   }
      //   console.log('name: ', name);
      //   replyMessage(replyToken, {
      //     'type': 'flex',
      //     'altText': 'สรุปเครดิตคงเหลือ ID 1-100',
      //     'contents': {
      //       'type': 'bubble',
      //       'header': {
      //         'type': 'box',
      //         'layout': 'vertical',
      //         'contents': [
      //           {
      //             'type': 'box',
      //             'layout': 'vertical',
      //             'contents': [
      //               {
      //                 'type': 'text',
      //                 'text': 'JK168',
      //                 'size': '20px',
      //                 'color': '#ffffff',
      //                 'align': 'center'
      //               }
      //             ],
      //             'paddingAll': '10px'
      //           },
      //           {
      //             'type': 'box',
      //             'layout': 'vertical',
      //             'contents': [
      //               {
      //                 'type': 'text',
      //                 'text': 'สรุปเครดิตคงเหลือ [1 - 100] 💸💸',
      //                 'color': '#ffffff'
      //               }
      //             ],
      //             'paddingAll': '10px'
      //           }
      //         ],
      //         'backgroundColor': '#E5001D',
      //         'alignItems': 'center',
      //         'background': {
      //           'type': 'linearGradient',
      //           'angle': '90deg',
      //           'startColor': '#000000',
      //           'endColor': '#E5001D'
      //         },
      //         'paddingAll': '5px'
      //       },
      //       'body': {
      //         'type': 'box',
      //         'layout': 'horizontal',
      //         'contents': [
      //           {
      //             'type': 'box',
      //             'layout': 'vertical',
      //             'contents': name
      //           },
      //           {
      //             'type': 'box',
      //             'layout': 'vertical',
      //             'contents': [
      //               {
      //                 'type': 'text',
      //                 'text': '50000฿',
      //                 'align': 'end'
      //               }
      //             ]
      //           }
      //         ]
      //       },
      //       'styles': {
      //         'header': {
      //           'backgroundColor': '#E5001D'
      //         }
      //       }
      //     }
      //   });
      //   break
      case isC:
        const newCommand = command.split("[");
        switch (newCommand[0]) {
          case "c":
            console.log("go C");
            const isBet = false;
            if (isBet) {
              replyMessage(replyToken, {
                type: "flex",
                altText: `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
                contents: {
                  type: "bubble",
                  header: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `[ID:${user.id}] ${profile.displayName}`,
                        color: "#ffffff",
                      },
                    ],
                    paddingAll: "10px",
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "เดิมพัน:",
                        color: "#00BE00",
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: "ขา1",
                          },
                          {
                            type: "text",
                            text: "ขา2",
                          },
                          {
                            type: "text",
                            text: "ขา3",
                          },
                          {
                            type: "text",
                            text: "ขา4",
                          },
                          {
                            type: "text",
                            text: "ขา5",
                          },
                          {
                            type: "text",
                            text: "ขา6",
                          },
                          {
                            type: "text",
                            text: "ขาลูกค้า",
                          },
                          {
                            type: "text",
                            text: "ขาเจ้า",
                          },
                        ],
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: `เครดิตคงเหลือ: ${user.wallet.balance}💰`,
                            color: "#027BFF",
                          },
                        ],
                      },
                    ],
                  },
                  styles: {
                    header: {
                      backgroundColor: "#6C757D",
                    },
                  },
                },
              });
            } else {
              replyMessage(replyToken, {
                type: "flex",
                altText: `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
                contents: {
                  type: "bubble",
                  header: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `[ID:${user.id}] ${profile.displayName}`,
                        color: "#ffffff",
                      },
                    ],
                    paddingAll: "10px",
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: `เครดิตคงเหลือ: ${user.wallet.balance}💰`,
                            color: "#027BFF",
                          },
                        ],
                      },
                    ],
                  },
                  styles: {
                    header: {
                      backgroundColor: "#6C757D",
                    },
                  },
                },
              });
            }
            break;
          case "cm":
            console.log("go CM");
            break;
        }
        break;
      default:
        playerBetting(command, user);
        break;
    }
  }
};

const adminCommand = async (event, profile, user) => {
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
  const command = message.text.toLowerCase();
  console.log("command: ", command);
  if (command.startsWith("$")) {
    console.log("ADD Credit");
    if (command.includes("+")) {
      const splitCommand = command.split("+");
      const id = splitCommand[0].slice("1");
      const amount = splitCommand[1];
      console.log("+");
      console.log("splitCommand: ", splitCommand);
      //increase wallet
      replyMessage(replyToken, {
        type: "flex",
        altText: "ยินดีต้อนรับสมาชิกใหม่",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "JK168",
                align: "center",
                color: "#ffffff",
              },
            ],
            paddingAll: "10px",
            backgroundColor: "#0BBB08",
          },
          hero: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "separator",
                color: "#ffffff",
                margin: "1px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: "เพิ่มเครดิต",
                            color: "#ffffff",
                          },
                          {
                            type: "text",
                            text: `${moment().format("l, h:mm:ss")}`,
                            align: "end",
                            color: "#EEEEEE",
                            wrap: true,
                            size: "10px",
                          },
                        ],
                        paddingStart: "20px",
                        paddingEnd: "20px",
                      },
                    ],
                    backgroundColor: "#0BBB08",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: `[ID: ${id}] .......`,
                            color: "#ffffff",
                            wrap: true,
                          },
                        ],
                        paddingStart: "20px",
                        paddingEnd: "20px",
                      },
                    ],
                    backgroundColor: "#0BBB08",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [],
                  },
                ],
                paddingAll: "5px",
              },
            ],
            backgroundColor: "#0BBB08",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "hello, world",
                  },
                  {
                    type: "text",
                    text: "hello, world",
                    align: "end",
                    color: "#0EBB07",
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "hello, world",
                  },
                  {
                    type: "text",
                    text: "hello, world",
                    align: "end",
                  },
                ],
              },
              {
                type: "separator",
                margin: "20px",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "hello, world",
                  },
                  {
                    type: "text",
                    text: "hello, world",
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "hello, world",
                  },
                  {
                    type: "text",
                    text: "hello, world",
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "#23gf32d2gs324",
                    size: "15px",
                    color: "#6C757D",
                  },
                ],
              },
            ],
          },
        },
      });
    } else if (command.includes("-")) {
      console.log("-");
      const splitCommand = command.split("-");
      const id = splitCommand[0].slice("1");
      const amount = splitCommand[1];
      //increase wallet
    }
  }
  if (command.startsWith("s")) {
    const result = await resultCalculate(command);
    console.log("------------------------------------");
    console.log("result: ", result);
    console.log("------------------------------------");
    const bankerResult = [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ขาเจ้า",
            align: "end",
            color: "#ffffff",
          },
        ],
        backgroundColor: "#00007D",
        cornerRadius: "10px",
        paddingAll: "6px",
      },
      {
        type: "separator",
        margin: "5px",
        color: "#ffffff",
      },
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `${result.banker.score >= 8 ? `ป็อก` : ``} ${
              result.banker.score
            } แต้ม${result.banker.bonus === 2 ? `เด้ง` : ``}`,
            color: "#00007D",
          },
        ],
        backgroundColor: "#DAE3FF",
        cornerRadius: "10px",
        paddingAll: "6px",
      },
    ];
    let playerResult = [];
    const sumResult = result.players.map((data, idx) => {
      playerResult.push(
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `ขา${idx + 1}`,
                  align: "end",
                  color: "#6D6D6D",
                },
              ],
              backgroundColor: "#E2E2E2",
              cornerRadius: "10px",
              paddingAll: "6px",
            },
            {
              type: "separator",
              margin: "5px",
              color: "#ffffff",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `${data.score >= 8 ? `ป็อก` : ``} ${data.score} แต้ม${
                    data.bonus === 2 ? `เด้ง` : ``
                  }`,
                  color: "#00007D",
                },
              ],
              backgroundColor: "#DAE3FF",
              cornerRadius: "10px",
              paddingAll: "6px",
            },
          ],
        },
        {
          type: "separator",
          margin: "5px",
          color: "#ffffff",
        }
      );
    });
    replyMessage(replyToken, {
      type: "flex",
      altText: `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "JK168",
              align: "center",
              color: "#FFAF29",
            },
          ],
          background: {
            type: "linearGradient",
            angle: "90deg",
            startColor: "#000000",
            endColor: "#E5001D",
          },
          paddingAll: "10px",
        },
        hero: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `ผลป๊อกเด้ง (#)`,
              align: "center",
              color: "#ffffff",
            },
          ],
          background: {
            type: "linearGradient",
            angle: "90deg",
            startColor: "#000000",
            endColor: "#E5001D",
          },
          borderColor: "#ffffff",
          paddingAll: "5px",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: bankerResult,
            },
            {
              type: "separator",
              margin: "5px",
              color: "#ffffff",
            },
            ...playerResult,
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `${
                        result.result === "BANKER"
                          ? "เจ้ามือชนะ"
                          : result.result === "PLAYER"
                          ? "ลูกค้าชนะ"
                          : "เสมอ"
                      }`,
                      align: "center",
                      color: "#ffffff",
                    },
                  ],
                  backgroundColor: `${
                    result.result === "BANKER"
                      ? "#00007D"
                      : result.result === "PLAYER"
                      ? "#017104"
                      : "#262626"
                  }`,
                  cornerRadius: "10px",
                  paddingAll: "6px",
                },
                {
                  type: "separator",
                  margin: "5px",
                  color: "#ffffff",
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "ยืนยันผลสรุป กด y หรือ Y",
                      color: "#000000",
                      align: "center",
                    },
                  ],
                  backgroundColor: "#FFFFB9",
                  cornerRadius: "10px",
                  paddingAll: "6px",
                },
              ],
            },
          ],
        },
      },
    });
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
      const round = await Round.findOneAndUpdate(
        {
          groupId,
          roundStatus: "OPEN",
        },
        {
          roundStatus: "CLOSE",
          updatedDate: new Date(),
        }
      )
        .sort({ roundId: -1, _id: -1 })
        .lean();
      if (!round) {
        return replyMessage(replyToken, {
          type: "text",
          text: `ขณะนี้ไม่มีรอบที่เปิดอยู่`,
        });
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
    case "ต": {
      replyMessage(replyToken, [
        // {
        //   type: 'image',
        //   originalContentUrl:
        //     'https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz',
        //   previewImageUrl:
        //     'https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz',
        // },
        {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
        },
      ]);
      break;
    }
  }
};

const playerBetting = async (input, user) => {
  const condition = "123456ลจ".split("");
  const _input = input.split("/");
  if (_input.length !== 2) return;
  const betKey = _input[0].split("");
  const betAmount = Number(_input[1]);
  if (isNaN(betAmount) || !betKey.every((e) => condition.includes(e))) return;
  if (Number(betAmount) > betLimit) return replyMessage({ client, replyToken, messageType: "INSUFFICIENT_BALANCE", profile });
  const round = await Round.findOne({ groupId, roundStatus: "OPEN" }).lean();
  if (!round)
    return replyMessage(replyToken, {
      type: "text",
      text: `ขณะนี้ไม่มีรอบการเล่นที่เปิดอยู่ กรุณารอเจ้ามือเปิดรอบค่ะ`,
    });
  let totalBetAmount = 0;
  const bet = betKey.reduce((a, v) => {
    totalBetAmount += isNaN(Number(v)) ? betAmount : betAmount * 2;
    return { ...a, [v]: betAmount };
  }, {});
  if (user.wallet.balance < totalBetAmount) return replyMessage({ client, replyToken, messageType: "INSUFFICIENT_BALANCE", user });
  new BetTransaction({
    userId: user.userId,
    roundId: round.roundId,
    groupId: round.groupId,
    balance: {
      bet: {
        before: user.wallet.balance,
        after: user.wallet.balance - totalBetAmount,
      },
      payout: {
        before: 0,
        after: 0,
      },
    },
    type: "BET",
    bet,
  }).save();
  await User.updateOne(
    { userId: user.userId },
    {
      "wallet.lastUpdated": new Date(),
      $inc: { "wallet.balance": -totalBetAmount },
    },
    { new: true }
  );
};

const resultCalculate = async (input) => {
  try {
    const _input = input.slice(1).split(",");
    let banker = {};
    let players = [];
    let totalScore = 0;
    _input.forEach((element, index) => {
      const [_bonus, ..._score] = element;
      const bonus = Number(_bonus);
      const score = Number(_score.join(""));
      if (isNaN(bonus) || isNaN(score)) throw new Error("Not a Number");
      if (index === 0) {
        banker = {
          score,
          bonus,
        };
      } else {
        players.push({
          score,
          bonus,
          winloseMultiplier: 0,
          winMultiplier: 1,
        });
      }
    });
    const _players = players.map((element) => {
      if (banker.score === element.score) {
        if (banker.bonus > element.bonus)
          element.winloseMultiplier = -banker.bonus;
        else if (banker.bonus < element.bonus)
          element.winloseMultiplier = element.bonus;
      } else {
        if (banker.score > element.score)
          element.winloseMultiplier = -banker.bonus;
        else element.winloseMultiplier = element.bonus;
      }
      if (banker.score === 0) element.winMultiplier = 0.9;
      totalScore += element.winloseMultiplier;
      return element;
    });
    const result = {
      banker,
      players: _players,
      result: totalScore === 0 ? "DRAW" : totalScore < 0 ? "BANKER" : "PLAYER",
    };
    return result;
  } catch (e) {
    console.log("Error =>", e);
    return replyMessage({ client, replyToken, messageType: "INVALID_RESULT" });
  }
};
