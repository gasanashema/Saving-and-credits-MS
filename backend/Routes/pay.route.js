const express = require("express");
const PayRouter = express.Router();
const axios = require('axios');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const conn = require("../db/connection");
dotenv.config();

PayRouter.post("/", async (req, res) => {
    try {
        const { loanId, amount } = req.body;
        const transectionId = Math.floor(Math.random() * 1000000000);
        const successUrl = `http://localhost:5173/umunyamuryango/${transectionId}/success`;
        const callback = `http://localhost:3000/pay/confirm/${transectionId}`;
        const formData = new URLSearchParams();
        formData.append('clientOrderId', loanId);
        formData.append('amount', amount);
        formData.append('api_key',process.env.MOMO_API_KEY);
        formData.append('callback', callback);
        formData.append('success_url', successUrl);
        const token = req.headers.authorization;
        const dt = new Date();
        const userId = jwt.verify(`${token}`, process.env.JWT_SECRET).id;
        const payment = await conn.query(
          "INSERT INTO `loanpayment`(`loanId`, `amount`, `recorderID`,`tra_id`) VALUES(?,?,?,?)",
          [loanId, amount, userId,transectionId]
        );
        if (payment) {
            const response = await axios.post('https://ubudasa.rw/initiate_payment.php', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
              }
            });   
          return  res.json(response.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
PayRouter.post("/saving", async (req, res) => {
    try {
        const { shares, amount,total } = req.body;
        const transectionId = Math.floor(Math.random() * 1000000000);
        const successUrl = `http://localhost:5173/umunyamuryango/${transectionId}/save-success`;
        const callback = ``;
        const formData = new URLSearchParams();
        formData.append('clientOrderId', transectionId);
        formData.append('amount', total);
        formData.append('api_key',process.env.MOMO_API_KEY);
        formData.append('callback', callback);
        formData.append('success_url', successUrl);
        const token = req.headers.authorization;
        const dt = new Date();
        const userId = jwt.verify(`${token}`, process.env.JWT_SECRET).id;
        const payment = await conn.query(
          "INSERT INTO `savingpayments`(`tra_id`, `shares`, `amount`, `member_id`) VALUES (?,?,?,?)",
          [transectionId,shares, total, userId]
        );
        if (payment) {
            const response = await axios.post('https://ubudasa.rw/initiate_payment.php', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });   
          return  res.json(response.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
PayRouter.post("/:id/confirm/", async (req, res) => {
    try {
        const transectionId = req.params.id;
        const [payData] = await conn.query("SELECT * from loanpayment where tra_id=?", [transectionId]);
        
      if (payData.length > 0 && payData[0].status != 'success') {
          const [loan]= await conn.query(
                    "SELECT * FROM loan WHERE `loanId`=?",
                    [payData[0].loanId]
        );
        const newPaidAmount = Number(payData[0].amount) + Number(loan[0].payedAmount);
        const loanStatus = loan[0].amountTopay == newPaidAmount ? "paid" : "active";
            const payAction = await conn.query(
                "UPDATE `loanpayment` SET status='success' where tra_id=?",
                [transectionId]
            );
            if (payAction) {
                const updater = await conn.query(
                    "UPDATE `loan` SET `payedAmount`=?, status=? WHERE `loanId`=?",
                    [newPaidAmount,loanStatus, payData[0].loanId]
              );
              console.log(loanStatus,newPaidAmount);
              
               await conn.query("COMMIT");
                
            }
              const data = {
            amount: payData[0].amount,
            transactionId: payData[0].tra_id,
            paymentMethod: "Mobile Money",

        }
            return res.json({ message: "Payment success", ok: true,...data });
        }
        const data = {
            amount: payData[0].amount,
            transactionId: payData[0].tra_id,
            paymentMethod: "Mobile Money",

        }
        return res.json({ message: "Payment already confirmed", ok: false,...data });
    }catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
PayRouter.put("/saving/:id/confirm", async (req, res) => {
  const transactionId = req.params.id;
  const token = req.headers.authorization;
  const dt = new Date();
  console.log("Transaction ID:", transactionId); // Log transaction ID
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const tokenString = token.split(" ").length > 1 ? token.split(" ")[1] : token;
  let userId;

  try {
    userId = jwt.verify(tokenString, process.env.JWT_SECRET).id;
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    await conn.query("START TRANSACTION");

    // Check if the transaction already exists
    const [data] = await conn.query(
      "SELECT * FROM savingpayments WHERE tra_id = ?",
      [transactionId]
    );

    console.log("Transaction Data:", data); // Log transaction data
    
    if (!data.length) {
      await conn.query("ROLLBACK");
      return res.status(404).json({ message: "Transaction not found", ok: false });
    }
   
    // Check if the payment is already confirmed
    if (data[0].status === "success") {
      await conn.query("COMMIT");
      return res.status(409).json({ message: "Payment already saved", ok: false, amount: data[0].amount });
    }
  
    // Check if savings record already exists for the current date
    const [dataExist] = await conn.query("SELECT * FROM savings WHERE createdAt = ?", [dt]);
    console.log("Existing Savings Data:", dataExist); // Log existing savings data

    if (dataExist.length > 0) {
      await conn.query("COMMIT");
      return res.status(200).json({ message: "Kwishyura byagenze neza!", ok: false });
    }

    // Update payment status to 'success'
    const [updatePayment] = await conn.query(
      "UPDATE savingpayments SET status = 'success' WHERE tra_id = ?",
      [transactionId]
    );
    await conn.query("COMMIT");

    console.log("Update Payment Result:", updatePayment); // Log update payment result

    if (updatePayment.affectedRows === 0) {
      await conn.query("ROLLBACK");
      return res.status(500).json({ message: "Failed to update payment status" });
    }

    // Insert savings record
    const { member_id, shares, amount } = data[0];
    const stId = amount === 10000 ? 1 : amount === 3000 ? 2 : 3;
    const shareValue = amount / shares;

    const [insertSavings] = await conn.query(
      "INSERT INTO savings (date, memberId, stId, numberOfShares, shareValue, user_id, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [dt, member_id, stId, shares, shareValue, userId, dt, dt]
    );

    console.log("Insert Savings Result:", insertSavings); // Log insert savings result

    if (insertSavings.affectedRows === 0) {
      await conn.query("ROLLBACK");
      return res.status(500).json({ message: "Failed to insert savings record" });
    }

    // Update member balance
    const [updateMemberBalance] = await conn.query(
      "UPDATE members SET balance = balance + ? WHERE id = ?",
      [amount, member_id]
    );

    console.log("Update Member Balance Result:", updateMemberBalance); // Log update member balance result

    if (updateMemberBalance.affectedRows === 0) {
      await conn.query("ROLLBACK");
      return res.status(500).json({ message: "Failed to update member balance" });
    }

    await conn.query("COMMIT");
    return res.json({ message: "Payment success", ok: true, amount, transactionId });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error in /saving/:id/confirm:", error); // Log the error
    return res.status(500).json({ error: error.message });
  }
});


module.exports= PayRouter;