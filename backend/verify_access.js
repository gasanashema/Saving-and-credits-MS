const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/ikv1";

const runTests = async () => {
  try {
    console.log("--- Testing Access Control ---");

    // 1. Login as Super Admin (sadmin@example.com / 12345)
    console.log("Logging in as Super Admin...");
    let saToken = "";
    try {
      const loginRes = await axios.post(`${BASE_URL}/users/auth`, {
        username: "sadmin@example.com",
        password: "12345",
        role: "admin",
      });
      saToken = loginRes.data.token;
      console.log("Super Admin Login Success");
    } catch (e) {
      console.error("Super Admin Login Failed");
      return;
    }

    const saHeaders = { Authorization: `Bearer ${saToken}` };

    // 2. Login as Normal Member (if possible, or just use a fake token to simulate non-admin)
    // For now we test Super Admin access to Admin routes.

    // 3. Test Super Admin on Legacy Admin Route (Add Penalty)
    // POST /penalities requires verifyAdmin
    console.log("\n--- Testing Super Admin on Admin Route (Add Penalty) ---");
    try {
      const penRes = await axios.post(
        `${BASE_URL}/penalities`,
        {
          memberId: 9, // Using a known member ID from seed
          amount: 100,
          pstatus: "unpaid",
          pType: 1, // Assuming type 1 exists
          date: "2025-01-01",
          comment: "Test Penalty by Super Admin",
        },
        { headers: saHeaders },
      );
      console.log(
        "Super Admin Add Penalty:",
        penRes.status === 201 || penRes.status === 200
          ? "SUCCESS"
          : `FAILED (${penRes.status})`,
      );
    } catch (e) {
      console.error(
        "Super Admin Add Penalty Failed:",
        e.response ? e.response.data : e.message,
      );
    }

    // 4. Test Super Admin on Legacy Saving Route (Add Saving)
    // POST /saving requires verifyAdmin
    console.log("\n--- Testing Super Admin on Admin Route (Add Saving) ---");
    try {
      const saveRes = await axios.post(
        `${BASE_URL}/saving`,
        {
          memberId: 9,
          stId: 1, // Assuming Saving Type 1 exists
          numberOfShares: 1,
          shareValue: 500,
          date: "2025-01-01",
        },
        { headers: saHeaders },
      );
      console.log(
        "Super Admin Add Saving:",
        saveRes.status === 201 || saveRes.status === 200
          ? "SUCCESS"
          : `FAILED (${saveRes.status})`,
      );
    } catch (e) {
      console.error(
        "Super Admin Add Saving Failed:",
        e.response ? e.response.data : e.message,
      );
    }

    // 5. Test Unauthorized Access (No Token)
    console.log("\n--- Testing Unauthorized Access ---");
    try {
      await axios.get(`${BASE_URL}/loans/configs`);
      console.log(
        "Unauthorized Access (Loan Configs): FAILED (Should have been protected)",
      );
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log("Unauthorized Access (Loan Configs): SUCCESS (Got 401)");
      } else {
        console.log(
          "Unauthorized Access (Loan Configs): FAILED (Got " +
            (e.response ? e.response.status : e.message) +
            ")",
        );
      }
    }
  } catch (error) {
    console.error("Global Test Error:", error.message);
  }
};

runTests();
