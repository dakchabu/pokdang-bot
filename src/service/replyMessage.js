const moment = require("moment");

class ReplyMessage {
  constructor(client) {
    this.client = client
  }
  reply = async ({
    replyToken,
    messageType,
    profile,
    user,
    data,
  }) => {
    try {
      await this.client.replyMessage(
        replyToken,
        this.message({ messageType, profile, user, data })
      );
    } catch (e) {
      console.log("replyMessage e =>", e);
    }
  };

  message = ({ messageType, profile, user, data = {} }) => {
    const defaultMessage = {
      MEMBER_REGISTER: {
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
      },
      MEMBER_EXISTS: {
        type: "text",
        text: `คุณ ${profile?.displayName} เป็นสมาชิกแล้วค่ะ`,
      },
      RULES: {
        type: "image",
        originalContentUrl:
          "https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6",
        previewImageUrl:
          "https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6",
      },
      HOWTO: {
        type: "image",
        originalContentUrl:
          "https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a",
        previewImageUrl:
          "https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a",
      },
      RECEIVE_IMAGE: {
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
                text: `เครดิตปัจจุบัน  ฿ 💰`,
              },
              {
                type: "text",
                text: "รอแอดมินดำเนินการสักครู่นะคะ 🫶",
              },
            ],
          },
        },
      },
      BET_STATUS_HAVEBET: {
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
      },
      BET_STATUS_NOBET: {
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
      },
      BETTRANSACTION_NOT_FOUND: {
        type: "text",
        text: `ไม่พบการเดิมพันในรอบปัจจุบัน`,
      },
      NO_ROUND_CANCELBET: {
        type: "text",
        text: `รอบนี้ถูกปิดรอบแทงไปแล้ว ไม่สามารถยกเลิกการเดิมพันได้`,
      },
      BET_SUCCESS: {
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
      },
      CANCEL_BET: {
        type: "text",
        text: `การเดิมพันในรอบนี้ของคุณ ${profile?.displayName} ถูกยกเลิกแล้ว`,
      },
      NO_ROUND: {
        type: "text",
        text: `ขณะนี้ไม่มีรอบการเล่นที่เปิดอยู่ กรุณารอเจ้ามือเปิดรอบค่ะ`,
      },
      NO_ROUND_ADMIN: {
        type: "text",
        text: `ขณะนี้ไม่มีรอบที่เปิดอยู่`,
      },
      EXISTS_ROUND: {
        type: "text",
        text: `ขณะนี้อยู่ในรอบที่ ${data?.roundId}`,
      },
      WAITING_ROUND_RESULT: {
        type: "text",
        text: `ขณะนี้มีรอบที่กำลังรอผลลัพธ์อยู่ รอบที่ ${data?.roundId} `,
      },
      OPEN_ROUND: [
        {
          type: "text",
          text: `=== รอบที่ ${data?.roundId} ===`,
        },
        {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96",
        },
      ],
      CLOSE_ROUND: [
        {
          type: "text",
          text: `=== ปิดรอบที่ ${data?.roundId} ===`,
        },
        {
          type: "image",
          originalContentUrl:
            "https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK",
          previewImageUrl:
            "https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK",
        },
      ],
      SPLIT_CARD: {
        type: "image",
        originalContentUrl:
          "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
        previewImageUrl:
          "https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_",
      },
      NOT_REACH_BETLIMIT: {
        type: "text",
        text: `⚠️ การเดิมพันน้อยกว่าจำนวนขั้นต่ำค่ะคุณ ${profile?.displayName} ⚠️`,
      },
      EXCEED_BETLIMIT: {
        type: "text",
        text: `⚠️ การเดิมพันเกินจำนวนค่ะคุณ ${profile?.displayName} ⚠️`,
      },
      INSUFFICIENT_BALANCE: {
        type: "text",
        text: `ยอดเงินของคุณไม่เพียงพอ เครดิตปัจจุบัน ${user?.wallet?.balance}`,
      },
      ADD_CREDIT: {
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
                            text: `[ID: ${user?.id}] ${profile?.displayName}`,
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
      },
      DEDUCT_CREDIT: {
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
                            text: `[ID: ${user?.id}] ${profile?.displayName}`,
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
                    text: `${Number(user?.wallet?.balance) +  data?.amount}`,
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
      },
      INVALID_RESULT: {
        type: "text",
        text: `ผลลัพธ์ไม่ถูกต้อง กรุณาใส่ผลลัพธ์ใหม่`,
      }
    };
    return defaultMessage[messageType];
  };
}

module.exports = { ReplyMessage }
