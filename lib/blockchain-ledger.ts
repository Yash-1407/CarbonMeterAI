import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

export type TransactionType = "EARNED" | "SENT" | "RECEIVED";

export interface Transaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  type: TransactionType;
  userId: string;
  amount: number;
  activity?: string;
  recipient?: string;
  sender?: string;
  status: "CONFIRMED";
}

// Helper to get supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' })
        }
    });
}

export function getUserWalletAddress(userId: string): string {
    const hash = CryptoJS.SHA256(userId || "anonymous").toString(CryptoJS.enc.Hex);
    return "0x" + hash.substring(0, 40);
}

export function generateTxHash(data: any): string {
    const stringified = JSON.stringify(data) + Date.now().toString() + Math.random().toString();
    const hash = CryptoJS.SHA256(stringified).toString(CryptoJS.enc.Hex);
    return "0x" + hash.substring(0, 8); 
}

export async function addTransaction(txData: Omit<Transaction, "txHash" | "blockNumber" | "timestamp" | "status">): Promise<Transaction> {
    const supabase = getSupabaseClient();
    
    // Simulate block number increment
    const blockNumber = Math.floor(Math.random() * 10000) + 1000000;
    
    const tx = {
        type: txData.type,
        user_id: txData.userId,
        amount: txData.amount,
        activity: txData.activity || null,
        sender_id: txData.sender || null,
        recipient_id: txData.recipient || null,
        tx_hash: generateTxHash(txData),
        block_number: blockNumber,
        status: "CONFIRMED"
    };

    const { data, error } = await supabase
        .from('ccct_transactions')
        .insert(tx)
        .select()
        .single();
        
    if (error) {
        console.error("Failed to add transaction:", error);
        throw new Error("Failed to add transaction to database");
    }

    return {
        txHash: data.tx_hash,
        blockNumber: data.block_number,
        timestamp: data.created_at,
        type: data.type as TransactionType,
        userId: data.user_id,
        amount: Number(data.amount),
        activity: data.activity,
        recipient: data.recipient_id,
        sender: data.sender_id,
        status: data.status as "CONFIRMED"
    };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
        .from('ccct_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
    }

    return data.map(dbTx => ({
        txHash: dbTx.tx_hash,
        blockNumber: dbTx.block_number,
        timestamp: dbTx.created_at,
        type: dbTx.type as TransactionType,
        userId: dbTx.user_id,
        amount: Number(dbTx.amount),
        activity: dbTx.activity,
        recipient: dbTx.recipient_id,
        sender: dbTx.sender_id,
        status: dbTx.status as "CONFIRMED"
    }));
}

export async function getBalance(userId: string): Promise<number> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
        .from('ccct_transactions')
        .select('type, amount')
        .eq('user_id', userId);
        
    if (error) {
        console.error("Failed to fetch balance:", error);
        return 0;
    }

    let balance = 0;
    for (const tx of data) {
        if (tx.type === "EARNED" || tx.type === "RECEIVED") {
            balance += Number(tx.amount);
        } else if (tx.type === "SENT") {
            balance -= Number(tx.amount);
        }
    }
    
    return balance;
}

export async function validateSmartContract(
    type: "EARN" | "TRADE", 
    data: any
): Promise<{ valid: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    if (type === "EARN") {
        const { userId, activity, amount } = data;
        if (!userId) reasons.push("User ID is required");
        if (amount <= 0 || amount > 50) reasons.push("Credits must be between 1 and 50 per activity");
        
    } else if (type === "TRADE") {
        const { senderId, recipientId, amount } = data;
        if (!senderId || !recipientId) reasons.push("Sender and Recipient IDs are required");
        if (senderId === recipientId) reasons.push("Cannot send to yourself");
        if (amount <= 0) reasons.push("Amount must be greater than 0");
        if (amount > 500) reasons.push("Max single trade is 500 credits");
        
        const balance = await getBalance(senderId);
        console.log("TRADE VALIDATION:", { senderId, recipientId, amount, balance });
        if (balance < amount) reasons.push("Insufficient balance");
    }

    return { valid: reasons.length === 0, reasons };
}

export function createRandomEthersWallet(): string {
   const wallet = ethers.Wallet.createRandom();
   return wallet.address;
}
