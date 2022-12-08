const line = require("@line/bot-sdk");
const moment = require("moment");

const User = require("../models/user.model");
const Round = require("../models/round.model");
const Match = require("../models/match.model");
const Report = require("../models/report.model");
const BackOffice = require("../models/backoffice.model");
const BetTransaction = require("../models/betTransaction.model");
const TransactionLog = require("../models/transactionLog.model");
const { ReplyMessage } = require("../../service/replyMessage");
const { lineNotify } = require("../../service/notify");

const { channelAccessToken } = require("../../config/vars");

const client = new line.Client({ channelAccessToken });
const betLimit = [20, 1000];
const replyMessage = new ReplyMessage(client);

exports.LineBot = async (req, res) => {
  try {
    const { destination, events } = req.body;
    const {
      type,
      message,
      joined,
      webhookEventId,
      deliveryContext,
      timestamp,
      source,
      replyToken,
      mode,
    } = events[0];
    const { userId, groupId } = source;
    if (message?.text === 'test') { // TODO EXAMPLE Fortest
      const gameGroupId = await BackOffice.findOne({
        gameGroupId: groupId
      }).lean()
      replyMessage.push({ groupId: gameGroupId.backOfficeGroupId, messageType: 'TEST' })
    }
    if (type === 'memberJoined' && type !== 'message' && joined !== undefined) {
      const userIdMember = joined.members;
      for (let i = 0; i < userIdMember.length; i++) {
        const profile = await client.getGroupMemberProfile(groupId, userIdMember[i].userId);
        return replyMessage.reply({ replyToken, messageType: "NEW_JOINER", profile });
      }
    }
    if (message?.text?.startsWith('ถอน') || message?.text === 'ถ') {
      const commandSplit = message?.text?.split(' ');
      const profile = await client.getGroupMemberProfile(groupId, userId);
      const user = await User.findOne({
        groupId,
        userId: profile.userId,
      }).lean();
      if (commandSplit.length === 1) {
        return replyMessage.reply({ replyToken, messageType: "HOW_WITHDRAW" });
      } else if (commandSplit.length > 1) {
        return replyMessage.reply({ replyToken, messageType: "WITHDRAW", profile, user, data: { amount: commandSplit[1], bankAcc: commandSplit[2], bankName: commandSplit[3], name: `${commandSplit[4]} ${commandSplit[5] ? commandSplit[5] : ''}` } });
      }
    }
    if (message?.text?.startsWith('npr') || message?.text?.startsWith('cm')) {
      const gameGroupId = await BackOffice.findOne({
        backOfficeGroupId: groupId
      }).lean()
      if (gameGroupId) {
        if (message?.text?.startsWith('npr')) {
          const checkLength = message.text.replace(/[[\]/npr]/gi, "");
          const match = await Match.findOne({
            groupId: gameGroupId.gameGroupId,
            type: "OPEN",
          }).lean();
          const report = await Report.findOne({
            matchId: match._id,
          }).lean();
          if (!report)
            return replyMessage.reply({
              replyToken,
              messageType: "DONT_HAVE_REPORT",
            });
          if (Number(checkLength)) {
            const winloseReport = Object.fromEntries(
              Object.entries(report.winloseReport).filter(
                ([id]) => id <= checkLength * 100 && id > (checkLength - 1) * 100
              )
            );
            replyMessage.reply({
              replyToken,
              messageType: "NPR_RESULT",
              data: { report: winloseReport, length: Number(checkLength), winloseSum: report.winloseSummary },
            });
          } else {
            replyMessage.reply({
              replyToken,
              messageType: "NPR_RESULT",
              data: { report: report.winloseReport, winloseSum: report.winloseSummary },
            });
          }
        } else if (message?.text?.startsWith('cm')) {
          const checkLength = message.text.replace(/[[\]/cm]/gi, "");
          if (Number(checkLength)) {
            const totalBalance = await User.find({
              groupId: gameGroupId.gameGroupId,
              role: "MEMBER",
              $and: [
                { id: { $gt: (checkLength - 1) * 100 } },
                { id: { $lte: checkLength * 100 } },
              ],
            })
              .select("-_id wallet.balance id username")
              .lean();
            if (totalBalance.length) {
              replyMessage.reply({
                replyToken,
                messageType: "TOTAL_CREDIT_REPORT",
                data: { user: totalBalance, length: Number(checkLength) },
              });
            } else {
              replyMessage.reply({
                replyToken,
                messageType: "NOT_HAVE_CREDIT_REPORT",
              });
            }
          } else {
            const totalBalance = await User.find({
              groupId: gameGroupId.gameGroupId,
              role: "MEMBER",
            })
              .select("-_id wallet.balance id username")
              .lean();
            if (totalBalance.length) {
              replyMessage.reply({
                replyToken,
                messageType: "TOTAL_CREDIT_REPORT",
                data: { user: totalBalance },
              });
            } else {
              replyMessage.reply({
                replyToken,
                messageType: "NOT_HAVE_CREDIT_REPORT",
              });
            }
          }
        }
        return console.log('this is backoffice')
      }
    }
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
          data: { id },
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
        profile.replyToken = replyToken;
        const user = await User.findOne({ userId: profile.userId, groupId }).lean();
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
  if (event.message.type !== 'Sticker') {
    if (["MEMBER"].includes(user.role))
      return memberCommand(event, profile, user);
    if (["ADMIN", "SUPERADMIN"].includes(user.role)) return adminCommand(event, profile, user);
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
  const { groupId, userId } = source;
  if (message.type === "image") {
    replyMessage.reply({
      replyToken,
      messageType: "RECEIVE_IMAGE",
      profile,
      user,
    });
  } else if (message.type === "text") {
    const command = message?.text?.toLowerCase();
    switch (command) {
      case "c":
        const betTransaction = await BetTransaction.findOne({
          groupId,
          userId,
          type: "BET",
        }).lean();
        if (betTransaction)
          replyMessage.reply({
            replyToken,
            messageType: "BET_STATUS_HAVEBET",
            profile,
            user,
            data: { bet: betTransaction.bet },
          });
        else
          replyMessage.reply({
            replyToken,
            messageType: "BET_STATUS_NOBET",
            profile,
            user,
          });
        break;
      case "x": {
        const match = await Match.findOne({
          groupId,
          type: "OPEN",
        }).lean();
        const round = await Round.findOne({
          matchId: match._id,
          roundStatus: "OPEN",
        }).lean();
        if (!round)
          return replyMessage.reply({
            replyToken,
            messageType: "NO_ROUND_CANCELBET",
            profile,
            user,
          });
        const betTransaction = await BetTransaction.findOne({
          groupId,
          userId,
          roundId: round._id,
          type: "BET",
        }).lean();
        if (!betTransaction)
          return replyMessage.reply({
            replyToken,
            messageType: "BETTRANSACTION_NOT_FOUND",
            profile,
            user,
          });
        await BetTransaction.updateOne(
          {
            _id: betTransaction._id,
          },
          {
            type: "CANCEL",
            "balance.after": user.wallet.balance,
          }
        );
        replyMessage.reply({ replyToken, messageType: "CANCEL_BET", profile });
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
  console.log("replyToken: ", replyToken);

  const { groupId, userId } = source;
  const command = message?.text?.toLowerCase();
  console.log("user.role: ", user.role);
  if(['SUPERADMIN'].includes(user.role)) {
    if(command.startsWith('createadmin')) {
      const getID = command.split('-');
      const userId = getID[1];
      const updateProfile = await User.findOneAndUpdate({ id: Number(userId), groupId: groupId}, { role: 'ADMIN'});
      replyMessage.reply({ replyToken, messageType: "SET_ADMIN", profile, data: { id: updateProfile.id, username: updateProfile.username } });
    }
  }
  if (command?.startsWith("$")) {
    if (command.includes("+")) {
      const splitCommand = command.split("+");
      const id = splitCommand[0].slice(1);
      const amount = Number(splitCommand[1]);
      const userMember = await User.findOneAndUpdate(
        {
          id,
          groupId,
        },
        {
          "wallet.lastUpdated": new Date(),
          $inc: { "wallet.balance": amount },
        },
        {
          new: true,
        }
      ).lean();
      const log = await new TransactionLog({
        approveByUsername: profile.displayName,
        approveByUserId: user.id,
        amount,
        balance: {
          before: Number(userMember.wallet.balance) - amount,
          after: Number(userMember.wallet.balance),
        },
        type: "ADD",
        memberUsername: userMember.username,
        memberId: userMember.id,
      }).save();
      await lineNotify(`
เติมเครดิต
[ID: ${userMember.id}] ${userMember.username}
จำนวน: ${amount}฿
------------------------
เครดิตเดิม: ${Number(userMember.wallet.balance) - amount}
เครดิตปัจจุบัน: ${Number(userMember.wallet.balance)}
------------------------
โดย: ${profile.displayName}
เวลา: ${moment().format("l, h:mm:ss")}
      `);
      replyMessage.reply({
        replyToken,
        messageType: "ADD_CREDIT",
        profile,
        user: userMember,
        data: { amount, logId: log._id },
      });
    } else if (command.includes("-")) {
      console.log("-");
      const splitCommand = command.split("-");
      const id = splitCommand[0].slice(1);
      const amount = Number(splitCommand[1]);
      const userMember = await User.findOneAndUpdate(
        {
          id,
          groupId: user.groupId,
        },
        {
          "wallet.lastUpdated": new Date(),
          $inc: { "wallet.balance": -amount },
        },
        {
          new: true,
        }
      ).lean();
      const log = await new TransactionLog({
        approveByUsername: profile.displayName,
        approveByUserId: user.id,
        amount,
        balance: {
          before: Number(userMember.wallet.balance) + amount,
          after: Number(userMember.wallet.balance),
        },
        type: "DEDUCT",
        memberUsername: userMember.username,
        memberId: userMember.id,
      }).save();
      replyMessage.reply({
        replyToken,
        messageType: "DEDUCT_CREDIT",
        profile,
        user: userMember,
        data: { id, amount, logId: log._id },
      });
    }
  }
  if (command?.startsWith("cm")) {
    const checkLength = command.replace(/[[\]/cm]/gi, "");
    if (Number(checkLength)) {
      const totalBalance = await User.find({
        groupId,
        role: "MEMBER",
        $and: [
          { id: { $gt: (checkLength - 1) * 100 } },
          { id: { $lte: checkLength * 100 } },
        ],
      })
        .select("-_id wallet.balance id username")
        .lean();
      if (totalBalance.length) {
        replyMessage.reply({
          replyToken,
          messageType: "TOTAL_CREDIT_REPORT",
          data: { user: totalBalance, length: Number(checkLength) },
        });
      } else {
        replyMessage.reply({
          replyToken,
          messageType: "NOT_HAVE_CREDIT_REPORT",
        });
      }
    } else {
      const totalBalance = await User.find({
        groupId,
        role: "MEMBER",
      })
        .select("-_id wallet.balance id username")
        .lean();
      if (totalBalance.length) {
        replyMessage.reply({
          replyToken,
          messageType: "TOTAL_CREDIT_REPORT",
          data: { user: totalBalance },
        });
      } else {
        replyMessage.reply({
          replyToken,
          messageType: "NOT_HAVE_CREDIT_REPORT",
        });
      }
    }
  }
  if (command?.startsWith("npr")) {
    const checkLength = command.replace(/[[\]/npr]/gi, "");
    const match = await Match.findOne({
      groupId,
      type: "OPEN",
    }).lean();
    const report = await Report.findOne({
      matchId: match._id,
    }).lean();
    if (!report)
      return replyMessage.reply({
        replyToken,
        messageType: "DONT_HAVE_REPORT",
      });
    if (Number(checkLength)) {
      const winloseReport = Object.fromEntries(
        Object.entries(report.winloseReport).filter(
          ([id]) => id <= checkLength * 100 && id > (checkLength - 1) * 100
        )
      );
      replyMessage.reply({
        replyToken,
        messageType: "NPR_RESULT",
        data: { report: winloseReport, length: Number(checkLength), winloseSum: report.winloseSummary },
      });
    } else {
      replyMessage.reply({
        replyToken,
        messageType: "NPR_RESULT",
        data: { report: report.winloseReport, winloseSum: report.winloseSummary },
      });
    }
  }
  if (command?.startsWith("s")) {
    const result = await resultCalculate(command);
    const match = await Match.findOne({
      groupId,
      type: "OPEN",
    }).lean();
    const round = await Round.findOne({
      matchId: match._id,
    })
      .sort({ _id: -1 })
      .lean();
    console.log("round: ", round);
    if (!round || round.roundStatus === "CLOSE")
      return replyMessage.reply({ replyToken, messageType: "ROUND_NOT_FOUND" });
    if (round.roundStatus === "OPEN")
      return replyMessage.reply({
        replyToken,
        messageType: "CLOSE_BEFORE_BET",
      });
    await Round.updateOne(
      {
        groupId,
        roundStatus: "RESULT",
      },
      {
        result,
      }
    ).sort({ _id: -1 });
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
    result.players.forEach((data, idx) => {
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
    const data = {
      bankerResult,
      playerResult,
      result: result.result.result,
      round: round.roundId
    };
    return replyMessage.reply({
      replyToken,
      messageType: "INPUT_RESULT",
      profile,
      user,
      data,
    });
  }
  switch (command) {
    case "a": {
      const match = await Match.findOne({
        groupId,
        type: "OPEN",
      }).lean();
      const round = await Round.findOne({
        matchId: match._id,
      })
        .sort({ _id: -1 })
        .lean();
      if (!round)
        return replyMessage.reply({
          replyToken,
          messageType: "NO_ROUND_ADMIN",
          profile,
          user,
        });
      const tran = await BetTransaction.find({
        roundId: round._id,
        groupId,
      });
      const betTransactions = tran.filter((v) => v.type !== 'CANCEL')
      replyMessage.reply({
        replyToken,
        messageType: "GET_BET_TRAN",
        profile,
        user,
        data: { betTransactions, round: round.roundId },
      });
      break;
    }
    case "o": {
      const match = await Match.findOne({
        groupId,
        type: "OPEN",
      }).lean();
      const round = await Round.findOne({
        matchId: match._id,
      })
        .sort({ _id: -1 })
        .lean();
      // if (round && round.roundStatus === "OPEN") return replyMessage.reply({ replyToken, messageType: "EXISTS_ROUND", profile, user, data: { roundId: round.roundId } });
      if (round && round.roundStatus === "RESULT")
        return replyMessage.reply({
          replyToken,
          messageType: "WAITING_ROUND_RESULT",
          profile,
          user,
          data: { roundId: round.roundId },
        });
      const roundId = round ? round.roundId + 1 : 1;
      new Round({
        roundId,
        matchId: match._id,
        groupId,
        createdByUsername: profile.displayName,
        createdByUserId: userId,
      }).save();
      replyMessage.reply({
        replyToken,
        messageType: "OPEN_ROUND",
        profile,
        user,
        data: { roundId },
      });
      break;
    }
    case "f": {
      const round = await Round.findOneAndUpdate(
        {
          groupId,
          roundStatus: "OPEN",
        },
        {
          roundStatus: "RESULT",
          updatedDate: new Date(),
        }
      ).lean();
      if (!round)
        return replyMessage.reply({
          replyToken,
          messageType: "NO_ROUND_ADMIN",
          profile,
          user,
        });
      replyMessage.reply({
        replyToken,
        messageType: "CLOSE_ROUND",
        profile,
        user,
        data: { roundId: round.roundId },
      });
      break;
    }
    case "ต": {
      replyMessage.reply({ replyToken, messageType: "SPLIT_CARD" });
      break;
    }
    case "y": {
      const round = await Round.findOne({
        groupId,
      })
        .sort({ _id: -1 })
        .lean();
      if (!round)
        return replyMessage.reply({
          replyToken,
          messageType: "NO_ROUND_ADMIN",
          profile,
          user,
        });
      if (round.roundStatus === "OPEN")
        return replyMessage.reply({
          replyToken,
          messageType: "CLOSE_BEFORE_BET",
        });
      if (round.roundStatus === "CLOSE")
        return replyMessage.reply({
          replyToken,
          messageType: "ROUND_NOT_FOUND",
        });
      if (
        round.roundStatus === "RESULT" &&
        (!round.result || Object.keys(round.result).length === 0)
      )
        return replyMessage.reply({ replyToken, messageType: "Y_NOT_RESULT" });
      const betTransactions = await BetTransaction.find({
        roundId: round._id,
        type: "BET",
      }).lean();
      let reportWinlose = {};
      let reportUsername = {};
      let report = [];
      let winloseSummary = 0;
      await betTransactions.forEach(async (betTransaction) => {
        let winlose = 0;
        const mergedBet = Object.entries(round.result.result).reduce(
          (c, [key, value]) => {
            if (!c[key]) return c;
            winlose += c[key] * value.winloseMultiplier * value.winMultiplier;
            return {
              ...c,
              [`${key}`]:
                c[key] * value.winloseMultiplier * value.winMultiplier,
            };
          },
          betTransaction.bet
        );
        winloseSummary += winlose;
        reportWinlose[`winloseReport.${betTransaction.userRunningId}.winlose`] = winlose;
        reportUsername[`winloseReport.${betTransaction.userRunningId}.username`] = betTransaction.username;
        const player = await User.findOneAndUpdate(
          {
            userId: betTransaction.userId,
          },
          {
            $inc: { "wallet.balance": winlose },
            "wallet.lastUpdated": new Date(),
          },
          { new: true }
        ).lean();
        report.push({
          id: betTransaction.userRunningId,
          username: betTransaction.username,
          winlose,
          balance: player.wallet.balance,
        });
        await BetTransaction.updateOne(
          {
            _id: betTransaction._id,
          },
          {
            $inc: { winlose },
            payout: mergedBet,
            "balance.after": player.wallet.balance,
            type: "PAYOUT",
          }
        );
      });
      reportWinlose.winloseSummary = -winloseSummary
      await Report.updateOne(
        { matchId: round.matchId },
        {
          $set: reportUsername,
          $inc: reportWinlose,
        },
        { setDefaultsOnInsert: true, upsert: true }
      );
      await Round.updateOne({ _id: round._id }, { roundStatus: "CLOSE" });
      //TODO notify report
      const roundSum = roundSummery(report)
      const holderWinlose = await Report.findOne({ matchId: round.matchId })
        .select('winloseSummary')
        .lean()
      const resNoti = `
สรุปกำไรขาดทุน รอบที่${(round.roundId).toString()}
ยอดบวก: ${roundSum.holderPlus}฿
ยอดลบ: ${roundSum.holderMinis}฿
รวม: ${roundSum.total}฿
รวมสุทธิ: ${holderWinlose.winloseSummary}฿
---------------------
เวลา: ${moment().format("l, h:mm:ss")}
      `
      console.log("resNoti: ", resNoti);
      await lineNotify(resNoti);
      return replyMessage.reply({
        replyToken,
        messageType: "Y_ON_RESULT",
        data: { report: report, round: round.roundId },
      });
      break;
    }
    case "r": {
      const match = await Match.findOne({
        groupId,
        type: "OPEN",
      }).lean();
      const round = await Round.findOne({
        matchId: match._id,
      }).sort({ _id: -1 })
        .lean();
      if (round.roundStatus !== 'CLOSE') return replyMessage.reply({ replyToken, messageType: "ROUND_NOT_FOUND" });
      let winloseSummary = 0;
      let reportWinlose = {}
      const betTransactions = await BetTransaction.find({
        roundId: round._id,
        type: "PAYOUT",
      }).lean();
      await betTransactions.forEach(async (betTransaction) => {
        winloseSummary += -betTransaction.winlose;
        reportWinlose[`winloseReport.${betTransaction.userRunningId}.winlose`] = -betTransaction.winlose;
        await User.updateOne(
          {
            userId: betTransaction.userId,
          },
          {
            $inc: { "wallet.balance": -betTransaction.winlose },
            "wallet.lastUpdated": new Date(),
          },
        )
        await BetTransaction.updateOne(
          {
            _id: betTransaction._id,
          },
          {
            $inc: { winlose: -betTransaction.winlose },
            payout: {},
            "balance.after": 0,
            type: "BET",
          }
        );
      })
      reportWinlose.winloseSummary = -winloseSummary
      console.log(reportWinlose)
      await Report.updateOne(
        { matchId: round.matchId },
        {
          $inc: reportWinlose,
        },
        { setDefaultsOnInsert: true, upsert: true }
      );
      await Round.updateOne({ _id: round._id }, { roundStatus: "RESULT", result: {} });
      return replyMessage.reply({
        replyToken,
        messageType: "RESET_ROUND_RESULT",
        data: { id: round.roundId }
      });
    }
    case "n": {
      await Round.updateOne(
        {
          groupId,
          roundStatus: "RESULT",
        },
        {
          result: {},
        }
      );
      replyMessage.reply({
        replyToken,
        messageType: "CANCEL_BET",
        profile,
        user,
      });
      break;
    }
    case "cr": {
      const match = await Match.findOne({
        groupId,
        type: "OPEN",
      }).lean();
      const gameGroupId = await BackOffice.findOne({
        gameGroupId: groupId
      }).lean()
      if (match) {
        const round = await Round.findOne({
          matchId: match._id,
        })
          .sort({ _id: -1 })
          .lean();
        if (round && round.roundStatus !== "CLOSE")
          return replyMessage.reply({
            replyToken,
            messageType: "CLOSE_AND_INPUT_RESULT",
          });
        await Match.updateOne(
          {
            _id: match._id,
          },
          {
            type: "CLOSE",
            updatedDate: new Date(),
          }
        );
        const report = await Report.findOne({
          matchId: match._id,
        }).lean();
        replyMessage.push({ groupId: gameGroupId.backOfficeGroupId, messageType: "BACK_OFFICE_REPORT",  data: { report: report}})
      }
      new Match({
        groupId,
        type: "OPEN",
      }).save();
      replyMessage.reply({
        replyToken,
        messageType: "CLEAR_ROUND"
      });
      break;
    }
    default: {
      break;
    }
  }
};

const playerBetting = async (input, profile, user) => {
  const condition = "123456ลจ".split("");
  const _input = input.split("/");
  if (_input.length !== 2) return;
  const betKey = _input[0].split("");
  const betAmount = Number(_input[1]);
  if (isNaN(betAmount) || !betKey.every((e) => condition.includes(e))) return;
  const round = await Round.findOne({
    groupId: user.groupId,
    roundStatus: "OPEN",
  }).lean();
  if (!round)
    return replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "NO_ROUND",
    });
  if (betAmount < betLimit[0])
    return replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "NOT_REACH_BETLIMIT",
      profile,
    });
  if (betAmount > betLimit[1])
    return replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "EXCEED_BETLIMIT",
      profile,
    });
  let totalBetAmount = 0;
  let turnover = 0;
  const bet = betKey.reduce((a, v) => {
    if (a[`b${v}`] !== undefined) return a;
    totalBetAmount += isNaN(Number(v)) ? betAmount : betAmount * 2;
    turnover += betAmount;
    return { ...a, [`b${v}`]: betAmount };
  }, {});
  const betTransaction = await BetTransaction.findOne({
    userId: user.userId,
    userRunningId: user.id,
    roundId: round._id,
    groupId: round.groupId,
    type: "BET",
  }).lean();
  if (
    user.wallet.balance <
    totalBetAmount + (Number(betTransaction?.betAmount) || 0)
  )
    return replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "INSUFFICIENT_BALANCE",
      user,
    });
  if (betTransaction) {
    if (user.wallet.balance < +Number(betTransaction.betAmount))
      return replyMessage.reply({
        replyToken: profile.replyToken,
        messageType: "INSUFFICIENT_BALANCE",
        user,
      });
    let isBetExceedLimit = false;
    const mergedBet = Object.entries(bet).reduce(
      (c, [key, value]) => {
        if ((c[key] || 0) + value > betLimit[1]) isBetExceedLimit = true;
        return { ...c, [`${key}`]: (c[key] || 0) + value };
      },
      { ...betTransaction.bet }
    );
    if (isBetExceedLimit)
      return replyMessage.reply({
        replyToken: profile.replyToken,
        messageType: "EXCEED_BETLIMIT",
        profile,
      });
    await BetTransaction.updateOne(
      {
        _id: betTransaction._id,
      },
      {
        $inc: {
          betAmount: totalBetAmount,
          turnover,
        },
        bet: mergedBet,
      }
    );
    replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "BET_SUCCESS",
      profile,
      user,
      data: { bet: mergedBet },
    });
  } else {
    new BetTransaction({
      userId: user.userId,
      username: user.username,
      userRunningId: user.id,
      roundId: round._id,
      groupId: round.groupId,
      betAmount: totalBetAmount,
      winlose: 0,
      turnover,
      balance: {
        before: user.wallet.balance,
        after: 0,
      },
      type: "BET",
      bet,
    }).save();
    replyMessage.reply({
      replyToken: profile.replyToken,
      messageType: "BET_SUCCESS",
      profile,
      user,
      data: { bet },
    });
  }
};

const resultCalculate = async (input) => {
  try {
    const _input = input.slice(1).split(",");
    let banker = {};
    let players = [];
    let result = {
      bจ: {
        winloseMultiplier: -1,
        winMultiplier: 1,
      },
      bล: {
        winloseMultiplier: -1,
        winMultiplier: 1,
      },
    };
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
        });
        result[`b${index}`] = {
          winloseMultiplier: 0,
          winMultiplier: 1,
        };
      }
    });
    players.forEach((element, index) => {
      if (banker.score === element.score) {
        if (banker.bonus > element.bonus)
          result[`b${index + 1}`].winloseMultiplier = -banker.bonus;
        else if (banker.bonus < element.bonus)
          result[`b${index + 1}`].winloseMultiplier = element.bonus;
      } else {
        if (banker.score > element.score)
          result[`b${index + 1}`].winloseMultiplier = -banker.bonus;
        else result[`b${index + 1}`].winloseMultiplier = element.bonus;
      }
      if (banker.score === 0 && result[`b${index + 1}`].winloseMultiplier > 0)
        result[`b${index + 1}`].winMultiplier = 0.9;
      totalScore += result[`b${index + 1}`].winloseMultiplier;
      return element;
    });
    result.result =
      totalScore === 0 ? "DRAW" : totalScore < 0 ? "BANKER" : "PLAYER";
    if (result.result === "BANKER") {
      result["bจ"] = {
        winloseMultiplier: 1,
        winMultiplier: 0.9,
      };
    } else if (result.result === "PLAYER") {
      result["bล"] = {
        winloseMultiplier: 1,
        winMultiplier: 0.9,
      };
    }
    return {
      banker,
      players,
      result,
    };
  } catch (e) {
    console.log("Error =>", e);
    return replyMessage.reply({ replyToken, messageType: "INVALID_RESULT" });
  }
};

const roundSummery = (report) => {
  const minusValue = report.filter((v) => v.winlose < 0);
  const plusValue = report.filter((v) => v.winlose > 0);
  let sumMinus = minusValue.reduce((partialSum, a) => partialSum + a.winlose, 0);
  let sumPlus = plusValue.reduce((partialSum, a) => partialSum + a.winlose, 0);
  return {
    holderPlus: sumMinus * -1,
    holderMinis: sumPlus * -1,
    total: (sumMinus * -1) + (sumPlus * -1),
    allRoundTotal: 1000
  }
}
