const line = require("@line/bot-sdk");
const User = require("../models/user.model");
const Round = require("../models/round.model");
const BetTransaction = require("../models/betTransaction.model");

const { channelAccessToken } = require('../../config/vars');

const client = new line.Client({ channelAccessToken });

exports.LineBot = async (req, res) => {
  try {
    const { destination, events } = req.body;
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

    let returnMessage;
    console.log('message.text', message.text);
    // const command = message.text.toLowerCase();
    switch (message.text) {
      case '@u' : {
        const profile = await client.getProfile(source.userId);
        const user = await User.findOne({ groupId, userId: profile.userId }).lean();
        console.log('user =>', user);
        if (user) {
          return replyMessage(replyToken, {
            type: 'text',
            text: `คุณ ${profile.displayName} เป็นสมาชิกแล้วค่ะ`,
          });
        }
        let { id } = (await User.findOne({ groupId })
          .select('-_id id')
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
          type: 'flex',
          altText: 'ยินดีต้อนรับสมาชิกใหม่',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'ยินดีต้อนรับ 🎉🎉',
                  size: '18px',
                  weight: 'bold',
                },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: 'คุณ',
                      flex: 1,
                    },
                    {
                      type: 'text',
                      text: `${profile.displayName}`,
                      flex: 4,
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '🆔',
                      flex: 1,
                    },
                    {
                      type: 'text',
                      text: `${id}`,
                      flex: 4,
                    },
                  ],
                },
                {
                  type: 'text',
                  text: 'ขอให้เพลิดเพลินกับการเล่นนะคะ 🎊 🎉',
                  wrap: true,
                  margin: 'xxl',
                },
              ],
            },
            styles: {
              header: {
                backgroundColor: '#35E267',
              },
            },
          },
        });
        break;
      }
      case 'กต': {
        returnMessage = {
          type: 'image',
          originalContentUrl:
            'https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6',
          previewImageUrl:
            'https://drive.google.com/uc?export=download&id=1W9jVpdtMkGCieVJkblMCMs4x4Iup1Na6',
        };
        replyMessage(replyToken, returnMessage);
        break;
      }
      case 'ว': {
        returnMessage = {
          type: 'image',
          originalContentUrl:
            'https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a',
          previewImageUrl:
            'https://drive.google.com/uc?export=download&id=18Rhyl57E5QuK3k_UAEyFIKzNA8BHyv5a',
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
    console.log('------------------------------------------');
    console.log('line lib err ====>', e);
    console.log('------------------------------------------');
  }
};

const replyMessage = async (replyToken, message) => {
  try {
    await client.replyMessage(replyToken, message);
    console.log('replyMessage Success');
  } catch (e) {
    console.log('replyMessage e =>', e);
  }
};

const roleSwitch = (event, profile, user) => {
  if (['MEMBER'].includes(user.role)) {
    return memberCommand(event, profile, user);
  }
  if (['ADMIN'].includes(user.role)) {
    return adminCommand(event, profile, user);
  }
};

const memberCommand = async (event, profile, user) => {
  console.log("user: ", user);
  console.log('Role: Member');
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
  console.log('profile: ', profile);
  console.log('event: ', event);
  if (message.type === 'image') {
    const txt = {
      'type': 'flex',
      'altText': `คุณ ${profile.displayName} ได้ส่งสลิปการโอนเงิน`,
      'contents': {
        'type': 'bubble',
        'body': {
          'type': 'box',
          'layout': 'vertical',
          'contents': [
            {
              'type': 'text',
              'text': `💫 คุณ ${profile.displayName} [ID : ${user.id}] 💫`,
            },
            {
              'type': 'text',
              'text': 'ได้ส่งสลิปการโอนเงิน 📩',
            },
            {
              'type': 'text',
              'text': `เครดิตปัจจุบัน ${user.wallet.balance} ฿ 💰`,
            },
            {
              'type': 'text',
              'text': 'รอแอดมินดำเนินการสักครู่นะคะ 🫶',
            },
          ],
        },
      },
    };
    replyMessage(replyToken, txt);
  } else if (message.type === 'text') {
    const command = message.text.toLowerCase();
    const isC = command.startsWith('c');
    switch (command, isC) {
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
        console.log('C Command');
        const newCommand = command.split('[');
        console.log("newCommand: ", newCommand);
        switch(newCommand[0]) {
          case 'c':
            console.log('go C');
            const isBet = false;
            if(isBet) {
              replyMessage(replyToken, {
                'type': 'flex',
                'altText': `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
                'contents': {
                  'type': 'bubble',
                  'header': {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'text',
                        'text': `[ID:${user.id}] ${profile.displayName}`,
                        'color': '#ffffff'
                      }
                    ],
                    'paddingAll': '10px'
                  },
                  'body': {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'text',
                        'text': 'เดิมพัน:',
                        'color': '#00BE00'
                      },
                      {
                        'type': 'box',
                        'layout': 'vertical',
                        'contents': [
                          {
                            'type': 'text',
                            'text': 'ขา1'
                          },
                          {
                            'type': 'text',
                            'text': 'ขา2'
                          },
                          {
                            'type': 'text',
                            'text': 'ขา3'
                          },
                          {
                            'type': 'text',
                            'text': 'ขา4'
                          },
                          {
                            'type': 'text',
                            'text': 'ขา5'
                          },
                          {
                            'type': 'text',
                            'text': 'ขา6'
                          }
                          ,
                          {
                            'type': 'text',
                            'text': 'ขาลูกค้า'
                          },
                          {
                            'type': 'text',
                            'text': 'ขาเจ้า'
                          }
                        ]
                      },
                      {
                        'type': 'box',
                        'layout': 'vertical',
                        'contents': [
                          {
                            'type': 'text',
                            'text': `เครดิตคงเหลือ: ${user.wallet.balance}💰`,
                            'color': '#027BFF'
                          }
                        ]
                      }
                    ]
                  },
                  'styles': {
                    'header': {
                      'backgroundColor': '#6C757D'
                    }
                  }
                }
              });
            } else {
              replyMessage(replyToken, {
                'type': 'flex',
                'altText': `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
                'contents': {
                  'type': 'bubble',
                  'header': {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'text',
                        'text': `[ID:${user.id}] ${profile.displayName}`,
                        'color': '#ffffff'
                      }
                    ],
                    'paddingAll': '10px'
                  },
                  'body': {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'box',
                        'layout': 'vertical',
                        'contents': [
                          {
                            'type': 'text',
                            'text': `เครดิตคงเหลือ: ${user.wallet.balance}💰`,
                            'color': '#027BFF'
                          }
                        ]
                      }
                    ]
                  },
                  'styles': {
                    'header': {
                      'backgroundColor': '#6C757D'
                    }
                  }
                }
              });
            }
            break
          case 'cm':
            console.log('go CM');
            break
        }
        break
      case 'ต':
        replyMessage(
          replyToken,
          [
            {
              type: 'image',
              originalContentUrl:
                'https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz',
              previewImageUrl:
                'https://drive.google.com/uc?export=download&id=1FNluIKULzKUWntQMu8MwK27Nhl8CcSYz',
            },
            {
              type: 'image',
              originalContentUrl:
                'https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_',
              previewImageUrl:
                'https://drive.google.com/uc?export=download&id=1NvAn2Tx9JHPytWeILHHEywj8Jsr4zM6_',
            },
          ]
        )
        break;
      default:
        // TODO BET Section
        console.log('command', command);
        const split = command.split('/');
        const bet = split[0];
        const price = split[1]
        //bet limit config vvvvvvv
        if(Number(price) <= 2000) {
          const splitBet = bet.split('');
          console.log('splitBet: ', splitBet);

          //return message
          replyMessage(replyToken, {
            'type': 'flex',
            'altText': `คุณ ${profile.displayName} [ID : ${user.id}] เดิมพัน`,
            'contents': {
              'type': 'bubble',
              'header': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                  {
                    'type': 'text',
                    'text': `[ID:${user.id}] ${profile.displayName}`,
                    'color': '#ffffff'
                  }
                ],
                'paddingAll': '10px'
              },
              'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                  {
                    'type': 'text',
                    'text': 'เดิมพัน:',
                    'color': '#00BE00'
                  },
                  {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'text',
                        'text': 'ขา1'
                      },
                      {
                        'type': 'text',
                        'text': 'ขา2'
                      },
                      {
                        'type': 'text',
                        'text': 'ขา3'
                      },
                      {
                        'type': 'text',
                        'text': 'ขา4'
                      },
                      {
                        'type': 'text',
                        'text': 'ขา5'
                      },
                      {
                        'type': 'text',
                        'text': 'ขา6'
                      }
                      ,
                      {
                        'type': 'text',
                        'text': 'ขาลูกค้า'
                      },
                      {
                        'type': 'text',
                        'text': 'ขาเจ้า'
                      }
                    ]
                  },
                  {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                      {
                        'type': 'text',
                        'text': `เครดิตคงเหลือ: ${user.wallet.balance}💰`,
                        'color': '#027BFF'
                      }
                    ]
                  }
                ]
              },
              'styles': {
                'header': {
                  'backgroundColor': '#6C757D'
                }
              }
            }
          });
        } else {
          replyMessage( replyToken, { type: 'text', text: `⚠️ การเดิมพันเกินจำนวนค่ะคุณ ${profile.displayName} ⚠️`})
        }
        break
    }
  }
};

const adminCommand = async (event, profile, user) => {
  console.log('event: ', event);
  console.log('Role: Admin');
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
  console.log('profile: ', profile);
  console.log('event: ', event);
  console.log('userProfile: ', user);
  const command = message.text.toLowerCase();
  console.log('command: ', command);
  if (command.startsWith('s')) {
    const result = resultCalculate(command)
    return
  }
  switch (command) {
    case 'o': {
      const round = await Round.findOne({ groupId })
        .sort({ roundId: -1, _id: -1 })
        .lean();
      if (round && round.roundStatus === 'OPEN') {
        return replyMessage(replyToken, {
          type: 'text',
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
          type: 'text',
          text: `=== รอบที่ ${roundId} ===`,
        },
        {
          type: 'image',
          originalContentUrl:
            'https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96',
          previewImageUrl:
            'https://drive.google.com/uc?export=download&id=1ZyLuxPIoC7Is-BiFgXa9EeJo8HDcru96',
        },
      ]);
      break;
    }
    case 'f': {
      const round = await Round.findOneAndUpdate({
          groupId,
          roundStatus: 'OPEN',
        }, {
          roundStatus: 'CLOSE',
          updatedDate: new Date(),
        })
        .sort({ roundId: -1, _id: -1 })
        .lean();
      if (!round) {
        return replyMessage(replyToken, {
            type: 'text',
            text: `ขณะนี้ไม่มีรอบที่เปิดอยู่`,
          })
      }
      replyMessage(replyToken, [
        {
          type: 'text',
          text: `=== ปิดรอบที่ ${round.id} ===`,
        },
        {
          type: 'image',
          originalContentUrl:
            'https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK',
          previewImageUrl:
            'https://drive.google.com/uc?export=download&id=11dOOUY5qAPEFF67EhLiXbHNgbRzMSWeK',
        },
      ]);
      break;
    }
  }
};

const playerBetting = async (input, user) => {
  const condition = '123456ลจ'.split('')
  const _input = input.split('/')
  if (_input.length !== 2) return
  const betKey = _input[0].split('')
  const betAmount = Number(_input[1])
  if (isNaN(betAmount) || !betKey.every((e) => condition.includes(e))) return
  const round = await Round.findOne({ groupId, roundStatus: "OPEN", }).lean()
  if (!round) {
    return replyMessage(replyToken, {
      type: "text",
      text: `ขณะนี้ไม่มีรอบการเล่นที่เปิดอยู่ กรุณารอเจ้ามือเปิดรอบค่ะ`,
    })
  }
  const totalBetAmount = betKey.length * betAmount * 2
  if (user.wallet.balance < totalBetAmount) {
    return replyMessage(replyToken, {
      type: "text",
      text: `ยอดเงินของคุณไม่เพียงพอ เครดิตปัจจุบัน ${user.wallet.balance}`,
    })
  }
  // TODO updateBalance
  const bet = betKey.reduce((a, v) => ({ ...a, [v]: betAmount}), {}) 
  new BetTransaction({
    userId: user.userId,
    roundId: round.roundId,
    groupId: round.groupId,
    balance: {
      bet: {
        before: user.wallet.balance + totalBetAmount,
        after: user.wallet.balance,
      },
      payout: {
        before: 0,
        after: 0
      }
    },
    type: 'BET',
    bet,
  }).save();
}

const resultCalculate = async (input) => {
  try {
    const _input = input.slice(1).split(',')
    let banker = {}
    let players = []
    let totalScore = 0

    _input.foinput((element, index) => {
      const [_bonus, ..._score] = element
      const bonus = Number(_bonus)
      const score = Number(_score.join(''))
      if (isNaN(bonus) || isNaN(score)) throw new Error('Not a Number')
      if (index === 0) {
        banker = {
          score,
          bonus
        }
      } else {
        players.push({
          score,
          bonus,
          winloseMultiplier: 0,
          winMultiplier: 1,
        })
      }
    })

    console.log(`ขาเจ้า : ${banker.score >= 8 ? 'ป๊อก' : ''}${banker.score} แต้ม${banker.bonus === 2 ? 'เด้ง' : ''}`)
    const _players = players.map((element, index) => {
      if (banker.score === element.score) {
        if (banker.bonus > element.bonus) element.winloseMultiplier = -banker.bonus
        else if (banker.bonus < element.bonus) element.winloseMultiplier = element.bonus
      } else {
        if (banker.score > element.score) element.winloseMultiplier = -banker.bonus
        else element.winloseMultiplier = element.bonus
      }
      if (banker.score === 0) element.winMultiplier = 0.9
      const str = `ขาที่ ${index + 1} : ${element.score >= 8 ? 'ป๊อก ' : ''}${element.score} แต้ม${element.bonus === 2 ? 'เด้ง' : ''} ${element.winloseMultiplier}\t${element.winloseMultiplier === 0 ? 'เสมอ' : element.winloseMultiplier > 0 ? 'ชนะ' : 'แพ้'}`
      totalScore += element.winloseMultiplier
      console.log(str)
      return element
    })
    console.log(`${totalScore === 0 ? 'เสมอ' : totalScore < 0 ? 'เจ้ามือชนะ' : 'ลูกค้าชนะ'}`)
    const result = {
      banker,
      players: _players,
      result: totalScore === 0 ? 'DRAW' : totalScore < 0 ? 'BANKER' : 'PLAYER'
    }
    console.log(result)
    return result
  } catch (e) {
    console.log('Error =>', e)
    return replyMessage(replyToken, {
      type: "text",
      text: `ผลลัพธ์ไม่ถูกต้อง กรุณาใส่ผลลัพธ์ใหม่`,
    })
  }
}
