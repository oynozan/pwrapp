const appID = "3e954ff4-220d-4cf7-aaaa-538c2684c1d3";
const appToken = "YOUR_APP_TOKEN";

// Button event listeners
const loginDiscordButton = document.getElementById("login-discord");
if (loginDiscordButton)
    loginDiscordButton.addEventListener("click", () => {
        window.location.href = `http://localhost:5000/auth/discord?appID=${appID}`;
    });

const loginGoogleButton = document.getElementById("login-google");
if (loginGoogleButton)
    loginGoogleButton.addEventListener("click", () => {
        window.location.href = `http://localhost:5000/auth/google?appID=${appID}`;
    });

// Get user data
const params = new URLSearchParams(window.location.search);
const wallet = params.get("wallet");
const uid = params.get("uid");

if (wallet) {
    getUserInfo(wallet);
}

async function getUserInfo(wallet) {
    // Get balance
    const balanceResponse = await fetch(`http://localhost:5000/wallet/balance?address=${wallet}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${appToken}`,
        },
    });

    const balance = (await balanceResponse.json()).balance;

    // Get user info
    const userResponse = await fetch(`http://localhost:5000/wallet/user?address=${wallet}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${appToken}`,
        },
    });

    const user = await userResponse.json();

    document.querySelector("#user-info").innerHTML = `
        <h2>User Info</h2>
        <img src="${user.pfp}" />
        <p><b>UID:</b> ${uid}</p>
        <p><b>Wallet:</b> ${wallet}</p>
        <p><b>E-mail:</b> ${user.email}</p>
        <p><b>Login Type:</b> ${user.loginType}</p>
        <p><b>Balance:</b> ${balance} PWR</p>
    `;
}
