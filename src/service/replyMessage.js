exports.replyMessage = async ({
  client,
  replyToken,
  messageType,
  profile,
  user,
}) => {
  try {
    await client.replyMessage(
      replyToken,
      message({ messageType, profile, user })
    );
  } catch (e) {
    console.log("replyMessage e =>", e);
  }
};

const message = ({ messageType, profile = {}, user = {}, id = 0 }) => {
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
    },
    MEMBER_EXISTS: {
      type: "text",
      text: `คุณ ${profile.displayName} เป็นสมาชิกแล้วค่ะ`,
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
      altText: `คุณ ${profile.displayName} ได้ส่งสลิปการโอนเงิน`,
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
    },
    EXCEED_BETLIMIT: {
      type: "text",
      text: `⚠️ การเดิมพันเกินจำนวนค่ะคุณ ${profile.displayName} ⚠️`,
    },
    INSUFFICIENT_BALANCE: {
      type: "text",
      text: `ยอดเงินของคุณไม่เพียงพอ เครดิตปัจจุบัน ${user.wallet.balance} ยอดเงินที่ต้องใช้ ${totalBetAmount}`,
    },
    INVALID_RESULT: {
      type: "text",
      text: `ผลลัพธ์ไม่ถูกต้อง กรุณาใส่ผลลัพธ์ใหม่`,
    },
  };
  return defaultMessage[messageType];
};
