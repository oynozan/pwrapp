import { Router } from "express";
import { PWRWallet } from "@pwrjs/core";

import userDB from "../db/User";
import { verifyApp } from "../funcs/middleware";

const router = Router();

/**
 * @description Get user information from the wallet
 */
router.get("/user", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address } = req.query;

        if (!address) return res.status(400).send({ message: "Address is required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        return res.send({
            email: user.email,
            loginType: user.type,
            pfp: user.pfp,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

/**
 * @description Get the balance of the user's wallet
 */
router.get("/balance", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address } = req.query;

        if (!address) return res.status(400).send({ message: "Address is required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        // Get the balance
        const wallet = new PWRWallet(user.privateKey);
        const balance = await wallet.getBalance();

        return res.send({ balance });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

/**
 * @description Send a transaction from the user's wallet
 */
router.post("/send-tx", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address, amount, to } = req.body;

        if (!address || !amount || !to)
            return res.status(400).send({ message: "Address, amount, and to are required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        // Send the transaction
        const wallet = new PWRWallet(user.privateKey);
        const nonce = await wallet.getNonce();

        const tx = await wallet.transferPWR(to as string, amount as string, nonce);
        if (tx.success) return res.send({ txHash: tx.transactionHash, message: tx.message });
        return res.status(400).send({ message: `Transaction failed - ${tx.message}` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

/**
 * @description Claim a VM ID
 */
router.post("/claim-vm", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address, vmId } = req.body;

        if (!vmId || !address)
            return res.status(400).send({ message: "Address and VM ID are required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        // Claim the VM ID
        const wallet = new PWRWallet(user.privateKey);
        const nonce = await wallet.getNonce();

        const tx = await wallet.claimVmId(vmId as string, nonce);
        if (tx.success) return res.send({ txHash: tx.transactionHash, message: tx.message });
        return res.status(400).send({ message: `Transaction failed - ${tx.message}` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

/**
 * @description Stake PWR
 */
router.post("/stake", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address, amount, validator } = req.body;

        if (!address || !amount || !validator)
            return res.status(400).send({ message: "Address, amount, and validator are required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        // Claim the VM ID
        const wallet = new PWRWallet(user.privateKey);
        const nonce = await wallet.getNonce();

        const tx = await wallet.delegate(validator as string, amount as string, nonce);
        if (tx.success) return res.send({ txHash: tx.transactionHash, message: tx.message });
        return res.status(400).send({ message: `Transaction failed - ${tx.message}` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

/**
 * @description Withdraw staked PWR
 */
router.post("/unstake", verifyApp, async (req, res) => {
    try {
        const { app } = req as any;
        const { address, shareAmount, validator } = req.query;

        if (!address || !shareAmount || !validator)
            return res.status(400).send({ message: "Address, amount, and validator are required" });

        // Get the user
        const user = await userDB.findOne(
            { wallet: address, appID: app._id },
            { _id: 0, __v: 0 },
            { lean: true },
        );

        if (!user) return res.status(404).send({ message: "User not found" });

        // Claim the VM ID
        const wallet = new PWRWallet(user.privateKey);
        const nonce = await wallet.getNonce();

        const tx = await wallet.withdraw(validator as string, shareAmount as string, nonce);
        if (tx.success) return res.send({ txHash: tx.transactionHash, message: tx.message });
        return res.status(400).send({ message: `Transaction failed - ${tx.message}` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "An error occured." });
    }
});

export default router;
