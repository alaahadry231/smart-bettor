import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

const betSchema = z.object({
  symbol_id: z.string().min(1),
  amount: z.number().positive(),
  odds: z.number().positive(),
  result: z.enum(['win', 'loss', 'pending']).default('pending'),
});

// GET: جلب كل الرهانات
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, symbol_id, amount, odds, result, profit, created_at
      FROM bets
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET bets error:', error);
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 });
  }
}

// POST: إضافة رهان جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = betSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid bet data', details: parsed.error.issues }, { status: 400 });
    }

    const { symbol_id, amount, odds, result } = parsed.data;
    const profit = result === 'win' ? (amount * odds) - amount : result === 'loss' ? -amount : 0;

    const rows = await sql`
      INSERT INTO bets (symbol_id, amount, odds, result, profit)
      VALUES (${symbol_id}, ${amount}, ${odds}, ${result}, ${profit})
      RETURNING id, symbol_id, amount, odds, result, profit, created_at
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('POST bets error:', error);
    return NextResponse.json({ error: 'Failed to add bet' }, { status: 500 });
  }
}

// PATCH: تحديث نتيجة رهان (win/loss)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, result } = body as { id: number; result: 'win' | 'loss' };

    if (!id || !['win', 'loss'].includes(result)) {
      return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
    }

    const existing = await sql`SELECT amount, odds FROM bets WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    const { amount, odds } = existing[0];
    const profit = result === 'win' ? (Number(amount) * Number(odds)) - Number(amount) : -Number(amount);

    const rows = await sql`
      UPDATE bets
      SET result = ${result}, profit = ${profit}
      WHERE id = ${id}
      RETURNING id, symbol_id, amount, odds, result, profit, created_at
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('PATCH bets error:', error);
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 });
  }
}

// PUT: مسح كل الرهانات
export async function PUT() {
  try {
    await sql`DELETE FROM bets`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT bets error:', error);
    return NextResponse.json({ error: 'Failed to clear bets' }, { status: 500 });
  }
}