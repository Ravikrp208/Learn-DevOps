const testAuth = async () => {
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";
  const name = "Test User";

  try {
    console.log("Testing Registration API...");
    const regRes = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    console.log("Reg Status:", regRes.status);
    const regData = await regRes.json();
    console.log("Reg Response:", JSON.stringify(regData, null, 2));

    if (regRes.status !== 201) {
      console.error("Registration failed!");
      return;
    }

    console.log("Testing Login API...");
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    console.log("Login Status:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Login Response:", JSON.stringify(loginData, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
};

testAuth();
