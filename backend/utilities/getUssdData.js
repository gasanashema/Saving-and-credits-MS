const conn = require("../db/connection");
const getDate = (txt) => {
  const date = new Date(txt);
  return date.toISOString();
};
const getUssdData = async (input) => {
  const nid = input.formartedText.split("*")[0];
  const choice = Number(input.formartedText.split("*")[1]);
  const [user] = await conn.query(
    "SELECT * from members where nid=? AND pin = ?",
    [nid, input.fText]
  );

  const [account] = user;
  const userExist = user.length == 1;
  if (!userExist) return "END Injiza umubare wibanga nyawo";
  const [penalities] = await conn.query(
    "SELECT `date`,penalties.amount amount, title,`pstatus` FROM `penalties` INNER JOIN ptypes WHERE ptypes.ptId=pType AND `memberId`=? AND `pstatus`='wait'",
    [account.member_id]
  );
  const [loan] = await conn.query(
    "SELECT amount, duration,requestDate, amountTopay,payedAmount,duration FROM `loan` WHERE `memberId`=? and status='active' LIMIT 1",
    [account.member_id]
  );
  switch (choice) {
    case 1:
      return `END Amafaranga mumaze kwizigama ni ${account.balance}`;
    case 2:
      let res = "END NTABIHANO URAHABWA";
      if (penalities.length > 0) {
        res = `END IBIHANO \n`;
        penalities.forEach((p, i) => {
          res += `${++i} ${
            p.title + "-(" + p.amount + " FRW)-" + getDate(p.date).split("T")[0]
          }\n`;
        });
      }
      return res;
    case 3:
      let resp = "END NTANGUZANYO MUREMERERWA";
      if (loan.length > 0) {
        resp = `END INGUZANYO  ${getDate(loan[0].requestDate).split("T")[0]}
               INGUZANYO yasabwe: ${loan[0].amount}
               INYUNGU: ${Number(loan[0].amountTopay) - Number(loan[0].amount)}
               Azishyurwa yose: ${loan[0].amountTopay},
               Igihe:${loan[0].duration},
               ayishuwe: ${loan[0].payedAmount}
               asigaye:${
                 Number(loan[0].amountTopay) - Number(loan[0].payedAmount)
               }
             `;
      }
      return resp;
  }
};
module.exports = getUssdData;
