const moment = require("moment");
class ReplyMessage {
  constructor(client) {
    this.client = client;
  }
  reply = async ({ replyToken, messageType, profile, user, data }) => {
    console.log('============================');
    console.log("replyToken: ", replyToken);
    console.log("messageType: ", messageType);
    console.log("profile: ", profile);
    console.log("user: ", user);
    console.log("data: ", data);
    console.log('============================');
    try {
      await this.client.replyMessage(
        replyToken,
        this.message({ messageType, profile, user, data })
      );
    } catch (e) {
      console.log("replyMessage e =>", e);
    }
  };

  push = async ({ groupId, messageType, profile, user, data }) => {
    console.log('============================');
    console.log("replyToken: ", groupId);
    console.log("messageType: ", messageType);
    console.log("profile: ", profile);
    console.log("user: ", user);
    console.log("data: ", data);
    console.log('============================');
    try {
      await this.client.pushMessage(
        groupId,
        this.message({ messageType, profile, user, data })
      );
    } catch (e) {
      console.log("pushMessage e =>", e);
    }
  };

  betTranMessage = ({ data }) => {
    const { betTransactions } = data;
    let deStruct = [];
    for (let i = 0; i < betTransactions?.length; i++) {
      deStruct.push(
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
                  text: `[ID: ${betTransactions[i]?.userRunningId}] ${betTransactions[i]?.username}`,
                  wrap: true,
                },
              ],
            },
            {
              type: "box",
              layout: "vertical",
              contents: this.userBetTran({ data: betTransactions[i] }),
            },
          ],
          paddingTop: "5px",
          paddingBottom: "5px",
        },
        {
          type: "separator",
        }
      );
    }
    return deStruct;
  };

  userBetTran = (data) => {
    const { bet } = data.data;
    const bet1 = bet?.b1;
    const bet2 = bet?.b2;
    const bet3 = bet?.b3;
    const bet4 = bet?.b4;
    const bet5 = bet?.b5;
    const bet6 = bet?.b6;
    const betBanker = bet?.bจ;
    const betPlayer = bet?.bล;
    const filter = [bet1, bet2, bet3, bet4, bet5, bet6, betBanker, betPlayer]
      .map((v, idx) => ({
        idx: idx + 1,
        bet: v,
      }))
      .filter((item) => item.bet !== undefined);
    let result = [];
    filter.forEach((v, i) => {
      result.push({
        type: "text",
        text: `ขา${
          v.idx === 8 ? "ลูกค้า" : v.idx === 7 ? "เจ้า" : "ที่" + v.idx
        } = ${v.bet}`,
        align: "end",
      });
    });
    return result;
  };

  totalBalanceHead = ({ data }) => {
    const { length } = data;
    if (length === undefined) {
      return [
        {
          type: "text",
          text: `สรุปเครดิตคงเหลือ`,
          align: "start",
          color: "#ffffff",
          offsetStart: "5px",
        },
      ];
    } else {
      return [
        {
          type: "text",
          text: `สรุปเครดิตคงเหลือ`,
          align: "start",
          color: "#ffffff",
          offsetStart: "5px",
        },
        {
          type: "text",
          text: `[ID ${length} - ${length * 100}]`,
          align: "start",
          color: "#ffffff",
          offsetStart: "5px",
        },
      ];
    }
  };

  totalBalance = ({ data }) => {
    const { user } = data;
    let deStruct = [];
    for (let i = 0; i < user?.length; i++) {
      deStruct.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${user[i]?.id}) ${user[i]?.username}`,
          },
          {
            type: "text",
            text: `${Number(user[i]?.wallet?.balance).toLocaleString()} ฿`,
            align: "end",
          },
        ],
      });
    }
    return deStruct;
  };

  sumDepositWithDraw = ({ data }) => {
    const { report } = data;
    if (!report) return;
    const key = Object.keys(report);
    const val = Object.values(report);
    let deStruct = [];
    for (let i = 0; i < key.length; i++) {
      deStruct.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${key[i]}) ${val[i].username}`,
          },
          {
            type: "text",
            text: `${Number(val[i]?.winlose).toLocaleString()} ฿`,
            color: this.colorDetect(Number(val[i]?.winlose)),
            align: "end",
          },
        ],
      });
    }
    return deStruct;
  };

  colorDetect = (data) => {
    if (String(data).startsWith("-")) {
      return "#E5001D";
    } else {
      return "#0BBB08";
    }
  };

  yResultMessage = ({ data }) => {
    const { report } = data;
    let deStruct = [];
    report.forEach((v, idx) => {
      deStruct.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${v.id}) ${v.username}`,
          },
          {
            type: "text",
            text: `${v.winlose} = ${Number(v.balance).toLocaleString()} ฿`,
            color: this.colorDetect(v.winlose),
            align: "end",
            wrap: true
          },
        ],
      });
    });
    return deStruct;
  };

  betResult = ({ data }) => {
    const { bet } = data;
    const bet1 = bet?.b1;
    const bet2 = bet?.b2;
    const bet3 = bet?.b3;
    const bet4 = bet?.b4;
    const bet5 = bet?.b5;
    const bet6 = bet?.b6;
    const betBanker = bet?.bจ;
    const betPlayer = bet?.bล;
    const filter = [bet1, bet2, bet3, bet4, bet5, bet6, betBanker, betPlayer]
      .map((v, idx) => ({
        idx: idx + 1,
        bet: v,
      }))
      .filter((item) => item.bet !== undefined);
    console.log('filter', filter);
    let result = [];
    filter.forEach((v, i) => {
      result.push({
        type: "text",
        text: `ขา${
          v.idx === 8 ? "ลูกค้า" : v.idx === 7 ? "เจ้า" : "ที่" + v.idx
        } = ${v.bet}`,
        align: "start",
      });
    });
    console.log('result', result);
    return result;
  }

  message = ({ messageType, profile, user, data = {} }) => {
    switch (messageType) {
      case "MEMBER_REGISTER": {
        return {
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
                  text: "ยินดีต้อนรับสู่ JK168 ค่ะ 🎉🎉",
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
                      text: `${profile?.displayName}`,
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
                      text: `${data?.id}`,
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
        };
      }
      case "MEMBER_EXISTS": {
        return {
          type: "text",
          text: `คุณ ${profile?.displayName} เป็นสมาชิกแล้วค่ะ`,
        };
      }
      case "RULES": {
        return [
          {
            type: "image",
            originalContentUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/how2.png",
            previewImageUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/how2.png",
          },
          {
            type: 'text',
            text: `♠️กรณีเปลี่ยนเจ้า / เปลี่ยนไพ่
ลูกค้าสามารถขอเปลี่ยนได้ ทุกๆ10เปิด
เจ้า หากแพ้ติดต่อกัน 3เปิด
สามารถเปลี่ยนเจ้าได้ ทุกกรณี♠️`
          }
        ];
      }
      case "HOWTO": {
        return {
          type: "image",
          originalContentUrl:
            "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/how1.png",
          previewImageUrl:
            "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/how1.png",
        };
      }
      case "RECEIVE_IMAGE": {
        return {
          type: "flex",
          altText: `คุณ ${profile?.displayName} ได้ส่งสลิปการโอนเงิน`,
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `💫 คุณ ${profile?.displayName} [ID : ${user?.id}] 💫`,
                },
                {
                  type: "text",
                  text: "ได้ส่งสลิปการโอนเงิน 📩",
                },
                {
                  type: "text",
                  text: `เครดิตปัจจุบัน ${user?.wallet?.balance}฿ 💰`,
                },
                {
                  type: "text",
                  text: "รอแอดมินดำเนินการสักครู่นะคะ 🫶",
                },
              ],
            },
          },
        };
      }
      case "BET_STATUS_HAVEBET": {
        return {
          type: "flex",
          altText: `คุณ ${profile?.displayName} [ID : ${user?.id}] เดิมพัน`,
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `[ID:${user?.id}] ${profile?.displayName}`,
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
                      text: `ขา1 = ${data?.bet?.b1 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขา2 = ${data?.bet?.b2 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขา3 = ${data?.bet?.b3 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขา4 = ${data?.bet?.b4 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขา5 = ${data?.bet?.b5 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขา6 = ${data?.bet?.b6 || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขาลูกค้า = ${data?.bet?.bล || 0}`,
                    },
                    {
                      type: "text",
                      text: `ขาเจ้า = ${data?.bet?.bจ || 0}`,
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `เครดิตคงเหลือ: ${user?.wallet?.balance}💰`,
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
        };
      }
      case "BET_STATUS_NOBET": {
        return {
          type: "flex",
          altText: `คุณ ${profile?.displayName} [ID : ${user?.id}] เดิมพัน`,
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `[ID:${user?.id}] ${profile?.displayName}`,
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
                      text: `เครดิตคงเหลือ: ${user?.wallet?.balance}💰`,
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
        };
      }
      case "BETTRANSACTION_NOT_FOUND": {
        return {
          type: "text",
          text: `ไม่พบการเดิมพันในรอบปัจจุบัน`,
        };
      }
      case "NO_ROUND_CANCELBET": {
        return {
          type: "text",
          text: `รอบนี้ถูกปิดรอบแทงไปแล้ว ไม่สามารถยกเลิกการเดิมพันได้`,
        };
      }
      case "BET_SUCCESS": {
        return {
          type: "flex",
          altText: `คุณ ${profile?.displayName} [ID : ${user?.id}] เดิมพัน`,
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `[ID:${user?.id}] ${profile?.displayName}`,
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
                  contents: data ? this.betResult({data}) : [],
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `เครดิตคงเหลือ: ${user?.wallet?.balance}💰`,
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
        };
        break;
      }
      case "CANCEL_BET": {
        return {
          type: "text",
          text: `การเดิมพันในรอบนี้ของคุณ ${profile?.displayName} ถูกยกเลิกแล้ว`,
        };
      }
      case "NO_ROUND_CANCEL": {
        return {
          type: "text",
          text: `ไม่พบรอบที่ต้องการรีเซ็ตผลลัพธ์ค่ะ`,
        };
      }
      case "RESET_ROUND_RESULT": {
        return {
          type: "text",
          text: `ทำการรีเซ็ตผลลัพธ์รอบที่ ${data?.id} กรุณาใส่ผลลัพธ์ใหม่อีกครั้งค่ะ`,
        };
      }
      case "NO_ROUND": {
        return {
          type: "text",
          text: `ขณะนี้ไม่มีรอบการเล่นที่เปิดอยู่ กรุณารอเจ้ามือเปิดรอบค่ะ`,
        };
      }
      case "EXISTS_ROUND": {
        return {
          type: "text",
          text: `ขณะนี้อยู่ในรอบที่ ${data?.roundId}`,
        };
      }
      case "WAITING_ROUND_RESULT": {
        return {
          type: "text",
          text: `ขณะนี้มีรอบที่กำลังรอผลลัพธ์อยู่ รอบที่ ${data?.roundId} `,
        };
      }
      case "OPEN_ROUND": {
        return [
          {
            type: "text",
            text: `=== รอบที่ ${data?.roundId} ===`,
          },
          {
            type: "image",
            originalContentUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/open.png",
            previewImageUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/open.png",
          },
        ];
      }
      case "CLOSE_ROUND": {
        return [
          {
            type: "text",
            text: `=== ปิดรอบที่ ===`,
          },
          {
            type: "image",
            originalContentUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/close.png",
            previewImageUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/close.png",
          },
        ];
      }
      case "SPLIT_CARD": {
        return [
          {
            type: "image",
            originalContentUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/cut2.png",
            previewImageUrl:
              "https://bot-pokdang-pic.s3.ap-southeast-1.amazonaws.com/cut2.png",
          },{
            type: 'text',
            text: `✅✅✅✅✅✅✅✅
- เชิญลูกค้าตัดไพ่ค่ะ
- ตัด 1-12 ใบ  เท่านั้น
- ห้ามเกิน 12ใบ
- ตัดซ้ำได้ไม่เกิน 2 ครั้งติดต่อกัน
- กรณีไม่มีใครตัดไพ่
เจ้ามือจะเอาหงายหนึ่งใบ
📍คนตัดไพ่ห้ามแทงเจ้ามือ`
          }
        ];
      }
      case "NOT_REACH_BETLIMIT": {
        return {
          type: "text",
          text: `⚠️ การเดิมพันน้อยกว่าจำนวนขั้นต่ำค่ะคุณ ${profile?.displayName} ⚠️`,
        };
        break;
      }
      case "EXCEED_BETLIMIT": {
        return {
          type: "text",
          text: `⚠️ การเดิมพันเกินจำนวนค่ะคุณ ${profile?.displayName} ⚠️`,
        };
        break;
      }
      case "INSUFFICIENT_BALANCE": {
        return {
          type: "text",
          text: `ยอดเงินของคุณไม่เพียงพอ เครดิตปัจจุบัน ${user?.wallet?.balance}`,
        };
        break;
      }
      case "ADD_CREDIT": {
        return {
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
                              text: `[ID: ${user?.id}] ${user?.username}`,
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
                      text: "ดำเนินการ",
                    },
                    {
                      type: "text",
                      text: `+${data?.amount}฿`,
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
                      text: "เครดิตเดิม",
                    },
                    {
                      type: "text",
                      text: `${Number(user?.wallet?.balance) - data?.amount}`,
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
                      text: "เครดิตปัจจุบัน",
                    },
                    {
                      type: "text",
                      text: `${user?.wallet?.balance}`,
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
                      text: "ดำเนินการโดย",
                    },
                    {
                      type: "text",
                      text: `${profile?.displayName}`,
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
                      text: `#${data?.logId}`,
                      size: "15px",
                      color: "#6C757D",
                    },
                  ],
                },
              ],
            },
          },
        };
        break;
      }
      case "DEDUCT_CREDIT": {
        return {
          type: "flex",
          altText: "ลบเครดิต",
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
              backgroundColor: "#E5011C",
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
                              text: "ลบเครดิต",
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
                      backgroundColor: "#E5011C",
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
                              text: `[ID: ${user?.id}] ${user?.username}`,
                              color: "#ffffff",
                              wrap: true,
                            },
                          ],
                          paddingStart: "20px",
                          paddingEnd: "20px",
                        },
                      ],
                      backgroundColor: "#E5011C",
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
              backgroundColor: "#E5011C",
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
                      text: "ดำเนินการ",
                    },
                    {
                      type: "text",
                      text: `-${data?.amount}฿`,
                      align: "end",
                      color: "#E5011C",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "เครดิตเดิม",
                    },
                    {
                      type: "text",
                      text: `${Number(user?.wallet?.balance) + data?.amount}`,
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
                      text: "เครดิตปัจจุบัน",
                    },
                    {
                      type: "text",
                      text: `${user?.wallet?.balance}`,
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
                      text: "ดำเนินการโดย",
                    },
                    {
                      type: "text",
                      text: `${profile?.displayName}`,
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
                      text: `#${data?.logId}`,
                      size: "15px",
                      color: "#6C757D",
                    },
                  ],
                },
              ],
            },
          },
        };
        break;
      }
      case "INPUT_RESULT": {
        return {
          type: "flex",
          altText: `ผลป๊อกเด้ง (#${data?.round})`,
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
                  text: `ผลป๊อกเด้ง (#${data?.round})`,
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
                  contents: data?.bankerResult,
                },
                {
                  type: "separator",
                  margin: "5px",
                  color: "#ffffff",
                },
                ...(data?.playerResult || []),
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
                            data?.result === "BANKER"
                              ? "เจ้ามือชนะ"
                              : data?.result === "PLAYER"
                              ? "ลูกค้าชนะ"
                              : "เสมอ"
                          }`,
                          align: "center",
                          color: "#ffffff",
                        },
                      ],
                      backgroundColor: `${
                        data?.result === "BANKER"
                          ? "#00007D"
                          : data?.result === "PLAYER"
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
        };
        break;
      }
      case "INVALID_RESULT": {
        return {
          type: "text",
          text: `ผลลัพธ์ไม่ถูกต้อง กรุณาใส่ผลลัพธ์ใหม่`,
        };
        break;
      }
      case "NO_ROUND_ADMIN": {
        return {
          type: "text",
          text: `ขณะนี้ไม่มีรอบที่เปิดอยู่`,
        };
        break;
      }
      case "CLOSE_BEFORE_BET": {
        return {
          type: "text",
          text: `ADMIN กรุณาปิดรอบการแทงก่อนค่ะ❗️`,
        };
        break;
      }
      case "ROUND_NOT_FOUND": {
        return {
          type: "text",
          text: `🚫 ไม่พบรอบการเล่นที่เปิดอยู่ค่ะ 🚫`,
        };
        break;
      }
      case "Y_NOT_RESULT": {
        return {
          type: "text",
          text: `ADMIN กรุณาใส่ผลลัพก่อนกด Y ค่ะ ⚠️`,
        };
        break;
      }
      case "CLOSE_AND_INPUT_RESULT": {
        return {
          type: "text",
          text: `ADMIN โปรดปิดรอบการแทงแลละใส่ผลลัพธ์การเล่นค่ะ ⚠️`,
        };
        break;
      }
      case "DONT_HAVE_REPORT": {
        return {
          type: "text",
          text: `ยังไม่มีรอบเล่นและรายงานของวันนี้ค่ะ ⚠️`,
        };
        break;
      }
      case "NOT_HAVE_CREDIT_REPORT": {
        return {
          type: "text",
          text: `ยังไม่มีข้อมูลของ ID ที่เล่นค่ะ ⚠️`,
        };
        break;
      }
      case "GET_BET_TRAN": {
        return {
          type: "flex",
          altText: `ผลการเล่น (#${data.round})`,
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
                  text: `ผลการเล่น (#${data.round})`,
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
              contents: data ? this.betTranMessage({ data }) : [],
            },
          },
        };
        break;
      }
      case "TOTAL_CREDIT_REPORT": {
        return {
          type: "flex",
          altText: `สรุปเครดิตคงเหลือ`,
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
              contents: data ? this.totalBalanceHead({ data }) : [],
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
              contents: data ? this.totalBalance({ data }) : [],
            },
          },
        };
        break;
      }
      case "NPR_RESULT": {
        return {
          type: "flex",
          altText: `สรุปกำไรขาดทุน`,
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
                  text: `${
                    data.length
                      ? `สรุปกำไรขาดทุนสมาชิก [ID${data.length}-${
                          data.length * 100
                        }]`
                      : "สรุปกำไรขาดทุนสมาชิก"
                  }`,
                  align: "start",
                  color: "#ffffff",
                  offsetStart: "5px",
                },
                {
                  type: "text",
                  text: `${moment().format("l, h:mm:ss")}`,
                  align: "start",
                  color: "#ffffff",
                  offsetStart: "5px",
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
              contents: data ? this.sumDepositWithDraw({ data }) : [],
            },
            footer: {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "รวม",
                  align: "end"
                },
                {
                  type: "text",
                  text: `${data?.winloseSum}`,
                  color: this.colorDetect(data?.winloseSum),
                  align: "end"
                }
              ]
            }
          },
        };
        break;
      }
      case "Y_ON_RESULT": {
        return {
          type: "flex",
          altText: `สรุปแพ้/ชนะรอบ (#${data.round})`,
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
                  text: `สรุปแพ้/ชนะรอบ (#${data.round})`,
                  align: "start",
                  color: "#ffffff",
                  offsetStart: "5px",
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
              contents: data ? this.yResultMessage({ data }) : [],
            },
          },
        };
        break;
      }
      case 'CLEAR_ROUND': {
        return {
          type: 'text',
          text: 'ดำเนินการเคลียรอบเรียบร้อยแล้วค่ะ'
        }
        break
      }
      case 'NEW_JOINER': {
        return {
          type: 'text',
          text: `คุณ ${profile?.displayName} กด @u เพื่อสมัครสมาชิกได้เลยค่ะ`
        }
      }
      case 'HOW_WITHDRAW': {
        return {
          "type": "flex",
          "altText": `วิธีถอน`,
          "contents": {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "วิธีถอนเงิน"
                }
              ],
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "พิมพ์คำว่า"
                },
                {
                  "type": "text",
                  "text": "ถอน จำนวนเงิน เลขบัญชี ชื่อ"
                },
                {
                  "type": "text",
                  "text": "เช่น"
                },
                {
                  "type": "text",
                  "text": "ถอน 5000 012345 รวย โชค"
                }
              ]
            }
          }
        };
        break
      }
      case 'WITHDRAW': {
        return {
          "type": "flex",
          "altText": `วิธีถอน`,
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "แจ้งถอน"
                },
                {
                  "type": "text",
                  "text": `[ID]: ${user?.id} `
                },
                {
                  "type": "text",
                  "text": `เครดิตปัจจุบัน: ${user?.wallet.balance}฿`
                },
                {
                  "type": "text",
                  "text": `ต้องการถอน: ${data?.amount}฿`
                },
                {
                  "type": "text",
                  "text": `ธนาคาร: ${data?.bankName}`
                },
                {
                  "type": "text",
                  "text": `เวลาที่แจ้ง: ${moment().format("l, h:mm:ss")}`
                },
                {
                  "type": "text",
                  "text": "--------"
                },
                {
                  "type": "text",
                  "text": "! หาก ข้อมูลการถอนไม่ถูกต้อง กรุณาพิม 'ถ' หรือ 'ถอน' เพื่อดูวิธีการถอนที่ถูกต้อง !",
                  "wrap": true
                },
              ]
            }
          }
        };
      }
      case "TEST": {
        return {
          type: "text",
          text: `ทดสอบการ Push Message`,
        };
      }
    }
  };
}

module.exports = { ReplyMessage };
