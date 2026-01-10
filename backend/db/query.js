const penalityQueryGenerator = (date, amount, pType = 1) => {
  return (
    "INSERT INTO penalties( `pType`, `amount`, `memberId`) SELECT '" +
    pType +
    "','" +
    amount +
    "', id FROM members LEFT JOIN savings ON savings.memberId=id WHERE id NOT IN (SELECT memberId FROM `members` INNER JOIN savings WHERE members.id = savings.memberId AND savings.date='" +
    date +
    "')"
  );
};
module.exports = penalityQueryGenerator;
