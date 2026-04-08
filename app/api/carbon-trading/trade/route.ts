import { NextResponse } from 'next/server';
import { addTransaction, validateSmartContract, getBalance } from '@/lib/blockchain-ledger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { senderId, recipientId, amount } = body;

        const validation = await validateSmartContract("TRADE", { senderId, recipientId, amount });

        if (!validation.valid) {
            return NextResponse.json({
                success: false,
                message: validation.reasons.join(", ")
            }, { status: 400 });
        }

        // Add the SENT transaction for the sender
        let senderTx;
        try {
            senderTx = await addTransaction({
                type: "SENT",
                userId: senderId,
                amount: amount,
                recipient: recipientId
            });

            // Add the RECEIVED transaction for the recipient
            await addTransaction({
                type: "RECEIVED",
                userId: recipientId,
                amount: amount,
                sender: senderId
            });
        } catch(e: any) {
            console.error("Trade transaction failed:", e);
            return NextResponse.json({
                success: false,
                message: "Trade Rejected: Recipient ID may be invalid or not found."
            }, { status: 400 });
        }

        const senderNewBalance = await getBalance(senderId);

        return NextResponse.json({
            success: true,
            txHash: senderTx.txHash,
            senderNewBalance,
            message: "Trade executed successfully"
        });

    } catch (error) {
        console.error("Internal Server Error during trade:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}
