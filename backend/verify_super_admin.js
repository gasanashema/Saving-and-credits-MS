const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/ikv1";

const runTests = async () => {
  try {
    console.log("--- Testing Super Admin Features ---");

    // 1. Login as Super Admin (sadmin@example.com / 12345)
    // Note: Need to ensure this user exists or use the one from seed
    console.log("Logging in as Super Admin...");
    let token = "";
    try {
      const loginRes = await axios.post(`${BASE_URL}/users/auth`, {
        username: "sadmin@example.com",
        password: "12345", // Default from seed
        role: "admin", // Logic tries user table first which has 'supperadmin' role
      });
      token = loginRes.data.token;
      console.log("Login Success. Role:", loginRes.data.role);
    } catch (e) {
      console.error("Login Failed:", e.response ? e.response.data : e.message);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Penalty Types
    console.log("\n--- Testing Penalty Types ---");
    try {
      const typeRes = await axios.post(
        `${BASE_URL}/penalities/types`,
        {
          title: "Test Penalty",
          amount: 500,
          description: "Automated Test",
        },
        { headers },
      );
      console.log(
        "Create Penalty Type:",
        typeRes.status === 201 ? "SUCCESS" : "FAILED",
      );
      const newTypeId = typeRes.data.id;

      const updateRes = await axios.put(
        `${BASE_URL}/penalities/types/${newTypeId}`,
        {
          title: "Test Penalty Updated",
          amount: 600,
        },
        { headers },
      );
      console.log(
        "Update Penalty Type:",
        updateRes.status === 200 ? "SUCCESS" : "FAILED",
      );

      const deleteRes = await axios.delete(
        `${BASE_URL}/penalities/types/${newTypeId}`,
        { headers },
      );
      console.log(
        "Delete Penalty Type:",
        deleteRes.status === 200 ? "SUCCESS" : "FAILED",
      );
    } catch (e) {
      console.error(
        "Penalty Types Test Failed:",
        e.response ? e.response.data : e.message,
      );
    }

    // 3. Test Saving Types
    console.log("\n--- Testing Saving Types ---");
    try {
      const saveTypeRes = await axios.post(
        `${BASE_URL}/saving/types`,
        {
          title: "Test Saving",
          amount: 1000,
          description: "Automated Test Save",
        },
        { headers },
      );
      console.log(
        "Create Saving Type:",
        saveTypeRes.status === 201 ? "SUCCESS" : "FAILED",
      );
      const newSaveId = saveTypeRes.data.id;

      const delSaveRes = await axios.delete(
        `${BASE_URL}/saving/types/${newSaveId}`,
        { headers },
      );
      console.log(
        "Delete Saving Type:",
        delSaveRes.status === 200 ? "SUCCESS" : "FAILED",
      );
    } catch (e) {
      console.error(
        "Saving Types Test Failed:",
        e.response ? e.response.data : e.message,
      );
    }

    // 4. Test User Creation
    console.log("\n--- Testing User Creation ---");
    try {
      const userRes = await axios.post(
        `${BASE_URL}/users`,
        {
          fullName: "Test Admin",
          email: `testadmin_${Date.now()}@example.com`,
          role: "admin",
        },
        { headers },
      );
      // Accept 200 or 201
      console.log(
        "Create Admin User:",
        userRes.status === 201 || userRes.status === 200
          ? "SUCCESS"
          : `FAILED (${userRes.status})`,
      );
    } catch (e) {
      console.error(
        "User Creation Test Failed:",
        e.response ? e.response.data : e.message,
      );
    }

    // 5. Test Loan Configs
    console.log("\n--- Testing Loan Configs ---");
    try {
      const configRes = await axios.get(`${BASE_URL}/loans/configs`, {
        headers,
      });
      console.log(
        "Get Configs:",
        configRes.status === 200 ? "SUCCESS" : "FAILED",
      );
      console.log("Configs Data:", configRes.data);

      if (configRes.data.length > 0) {
        const firstKey = configRes.data[0].config_key;
        const updateConfigRes = await axios.put(
          `${BASE_URL}/loans/configs/${firstKey}`,
          {
            value: "10", // Test update
          },
          { headers },
        );
        console.log(
          `Update Config ${firstKey}:`,
          updateConfigRes.status === 200 ? "SUCCESS" : "FAILED",
        );
      }
    } catch (e) {
      console.error(
        "Loan Configs Test Failed:",
        e.response ? e.response.data : e.message,
      );
      console.error("Full Error:", e);
    }
  } catch (error) {
    console.error("Global Test Error:", error.message);
  }
};

runTests();
