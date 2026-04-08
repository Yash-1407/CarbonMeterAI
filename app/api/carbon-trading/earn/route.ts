import { NextResponse } from 'next/server';
import { addTransaction, validateSmartContract, getBalance } from '@/lib/blockchain-ledger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, activity, credits } = body;

        const validation = await validateSmartContract("EARN", { userId, activity, amount: credits });

        if (!validation.valid) {
            return NextResponse.json({
                success: false,
                message: validation.reasons.join(", ")
            }, { status: 400 });
        }

        const tx = await addTransaction({
            type: "EARNED",
            userId: userId,
            amount: credits,
            activity: activity
        });

        const newBalance = await getBalance(userId);

        return NextResponse.json({
            success: true,
            newBalance,
            txHash: tx.txHash,
            blockNumber: tx.blockNumber
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}
