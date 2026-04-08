import { NextResponse } from 'next/server';
import { getTransactions, getBalance, getUserWalletAddress } from '@/lib/blockchain-ledger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User ID is required"
            }, { status: 400 });
        }

        const transactions = await getTransactions(userId);
        const balance = await getBalance(userId);
        const walletAddress = getUserWalletAddress(userId);

        return NextResponse.json({
            success: true,
            transactions,
            balance,
            walletAddress
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}
