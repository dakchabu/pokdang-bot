const line = require("@line/bot-sdk");
const User = require("../models/user.model");
const Round = require("../models/round.model");
const BetTransaction = require("../models/betTransaction.model");
const CreditLog = require('../models/creditLog.model');
const { ReplyMessage } = require("../../service/replyMessage");

const { channelAccessToken } = require("../../config/vars");

const client = new line.Client({ channelAccessToken });
const minBet = 20;
const betLimit = 2000;
const replyMessage = new ReplyMessage(client)

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
          return replyMessage.reply({
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
        replyMessage.reply({
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
        replyMessage.reply({ replyToken, messageType: "RULES" });
        break;
      }
      case "ว": {
        replyMessage.reply({ replyToken, messageType: "HOWTO" });
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
  if (["MEMBER"].includes(user.role)) return memberCommand(event, profile, user)
  if (["ADMIN"].includes(user.role)) return adminCommand(event, profile, user)
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
  const { groupId, userId } = source
  if (message.type === "image") {
    replyMessage.reply({ replyToken, messageType: "RECEIVE_IMAGE", profile, user });
  } else if (message.type === "text") {
    const command = message.text.toLowerCase();
    switch (command) {
      case "c":
        const betTransaction = await BetTransaction.find({ groupId, userId, type: 'BET'})
        // TODO REPLY MESSAGE
        if (betTransaction.length > 0) replyMessage.reply({ replyToken, messageType: "BET_STATUS_HAVEBET", profile, user });
        // TODO REPLY MESSAGE
        else replyMessage.reply({ replyToken, messageType: "BET_STATUS_NOBET", profile, user });
        break;
      case "x": {
        const round = await Round.findOne({
          groupId,
          roundStatus: "OPEN",
        }).sort({ roundId: -1, _id: -1 })
          .lean();
        if (!round) return replyMessage.reply({ replyToken, messageType: "NO_ROUND_CANCELBET", profile, user });
        const betTransaction = await BetTransaction.findOne({ groupId, userId, roundId: round._id, type: 'BET' }).lean()
        if (!betTransaction) return replyMessage.reply({ replyToken, messageType: "BETTRANSACTION_NOT_FOUND", profile, user });
        await BetTransaction.updateOne({
          _id: betTransaction._id
        }, {
          type: "CANCEL",
          balance: {
            cancel: {
              before: user.wallet.balance,
              after: user.wallet.balance + betTransaction.betAmount,
            }
          }
        })
        await User.updateOne({
          id,
          groupId: user.groupId
        }, {
          "wallet.lastUpdated": new Date(),
          $inc: {
            "wallet.balance": betTransaction.betAmount,
            "wallet.buyIn": -betTransaction.betAmount
          },
        });
        // TODO REPLY CANCEL SUCCESS
      }
      default:
        playerBetting(command, profile, user);
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
  if (command.startsWith("$")) {
    if (command.includes("+")) {
      const splitCommand = command.split("+");
      const id = splitCommand[0].slice(1);
      const amount = splitCommand[1];
      const memberProfile = await User.findOne({ id, groupId: user.groupId}).lean();
      await User.updateOne({
        id,
        groupId: user.groupId
      }, {
        "wallet.lastUpdated": new Date(),
        $inc: { "wallet.balance": amount },
      });
      const log = await CreditLog.create({
        approveBy: profile.displayName,
        amount: amount,
        forMember: memberProfile.username,
        memberId: memberProfile.id,
      })
      replyMessage.reply({ replyToken, messageType: "ADD_CREDIT", profile, user, id, amount, memberProfile, log });
    } else if (command.includes("-")) {
      console.log("-");
      const splitCommand = command.split("-");
      const id = splitCommand[0].slice(1);
      const amount = splitCommand[1];
      const memberProfile = await User.findOne({ id, groupId: user.groupId}).lean();
      await User.updateOne({
        id,
        groupId: user.groupId
      }, {
        "wallet.lastUpdated": new Date(),
        $inc: { "wallet.balance": -amount },
      });
      const log = await CreditLog.create({
        approveBy: profile.displayName,
        amount: amount,
        forMember: memberProfile.username,
        memberId: memberProfile.id,
      })
      replyMessage.reply({ replyToken, messageType: "DEDUCT_CREDIT", profile, user, id, amount, memberProfile, log });
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
            text: `${result.banker.score >= 8 ? `ป็อก` : ``} ${result.banker.score
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
                  text: `${data.score >= 8 ? `ป็อก` : ``} ${data.score} แต้ม${data.bonus === 2 ? `เด้ง` : ``
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
    replyMessage.reply(replyToken, {
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
                      text: `${result.result === "BANKER"
                        ? "เจ้ามือชนะ"
                        : result.result === "PLAYER"
                          ? "ลูกค้าชนะ"
                          : "เสมอ"
                        }`,
                      align: "center",
                      color: "#ffffff",
                    },
                  ],
                  backgroundColor: `${result.result === "BANKER"
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
      const round = await Round.findOne({
        groupId
      }).sort({ roundId: -1, _id: -1 })
        .lean();
      if (round && round.roundStatus === "OPEN") return replyMessage.reply({ replyToken, messageType: "EXISTS_ROUND", profile, user, id: round.roundId });
      if (round && round.roundStatus === "RESULT") return replyMessage.reply({ replyToken, messageType: "WAITING_ROUND_RESULT", profile, user, id: round.roundId });
      const roundId = round ? round.id + 1 : 1;
      new Round({
        roundId,
        groupId,
        createdByUsername: profile.displayName,
        createdByUserId: userId,
      }).save();
      replyMessage.reply({ replyToken, messageType: "OPEN_ROUND", profile, user, id: roundId });
      break;
    }
    case "f": {
      const round = await Round.findOneAndUpdate({
        groupId,
        roundStatus: "OPEN",
      }, {
        roundStatus: "RESULT",
        updatedDate: new Date(),
      }).sort({ roundId: -1, _id: -1 })
        .lean();
      if (!round) return replyMessage.reply({ replyToken, messageType: "NO_ROUND_ADMIN", profile, user });
      replyMessage.reply({ replyToken, messageType: "CLOSE_ROUND", profile, user });
      break;
    }
    case "ต": {
      replyMessage.reply({ replyToken, messageType: "SPLIT_CARD" });
      break;
    }
    case "y": {
      const round = await Round.findOne({
        groupId
      }).sort({ roundId: -1, _id: -1 })
        .lean();
      if (!round) return replyMessage.reply({ replyToken, messageType: "NO_ROUND_ADMIN", profile, user });
      if (round.roundStatus === 'OPEN') return console.log('TODO') // TODO Reply โปรดปิดรอบการแทง
      if (round.roundStatus === 'CLOSE') return console.log('TODO') // TODO Reply ไม่พบรอบการเล่น
      if (Object.keys(round.result).length === 0) return console.log('TODO') // TODO Reply โปรดใส่ผลลัพธ์การเล่นก่อนปิดรอบ
      // TODO PAYOUT
      await Round.updateOne({
        _id: round._id
      }, {
        roundStatus: 'CLOSED'
      })
    }
    default: {
      break
    }
  }
};

const playerBetting = async (input, profile, user) => {
  console.log(input, profile, user)
  const condition = "123456ลจ".split("");
  const _input = input.split("/");
  if (_input.length !== 2) return;
  const betKey = _input[0].split("");
  const betAmount = Number(_input[1]);
  if (isNaN(betAmount) || !betKey.every((e) => condition.includes(e))) return;
  if (Number(betAmount) > betLimit) return replyMessage.reply({ replyToken: profile.replyToken, messageType: "EXCEED_BETLIMIT", profile });
  const round = await Round.findOne({ groupId: user.groupId, roundStatus: "OPEN" }).lean();
  if (!round) return replyMessage.reply({ replyToken: profile.replyToken, messageType: "NO_ROUND" });
  let totalBetAmount = 0;
  let turnover = 0;
  const bet = betKey.reduce((a, v) => {
    if (a[v] !== undefined) return a
    totalBetAmount += isNaN(Number(v)) ? betAmount : betAmount * 2;
    turnover += betAmount
    return { ...a, [v]: betAmount };
  }, {});
  if (user.wallet.balance < totalBetAmount) return replyMessage.reply({ replyToken: profile.replyToken, messageType: "INSUFFICIENT_BALANCE", user });
  // TODO Check Bettransaction isExists before betting and check betLimit
  new BetTransaction({
    userId: user.userId,
    roundId: round._id,
    groupId: round.groupId,
    betAmount: totalBetAmount,
    winlose: -totalBetAmount,
    turnover,
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
  await User.updateOne({
    userId: user.userId
  }, {
    "wallet.lastUpdated": new Date(),
    $inc: {
      "wallet.balance": -totalBetAmount,
      "wallet.buyIn": totalBetAmount,
    },
  });
  // TODO REPLY MESSAGE
  replyMessage.reply({ replyToken: profile.replyToken, messageType: "BET_SUCCESS", user });
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
    return replyMessage.reply({ replyToken, messageType: "INVALID_RESULT" });
  }
};
