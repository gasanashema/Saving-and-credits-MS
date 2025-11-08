const penalityQueryGenerator = (date, amount, pType = 1) => {
  return (
    "INSERT INTO penalties( `pType`, `amount`, `memberId`) SELECT '" +
    pType +
    "','" +
    amount +
    "', member_id FROM members LEFT JOIN savings ON savings.memberId=member_id WHERE member_id NOT IN (SELECT memberId FROM `members` INNER JOIN savings WHERE members.member_id = savings.memberId AND savings.date='" +
    date +
    "')"
  );
};
module.exports = penalityQueryGenerator;
