import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

const settingsSchema = z.object({
  bankroll: z.number().min(0),
  stop_loss_pct: z.number().min(1).max(100),
  stop_win_pct: z.number().min(1).max(100),
  max_daily_bets: z.number().int().min(1),
  bet_size_pct: z.number().min(0.1).max(100),
});

// GET: جلب الإعدادات
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct
      FROM settings
      ORDER BY id ASC
      LIMIT 1
    `;

    if (rows.length === 0) {
      const created = await sql`
        INSERT INTO settings (bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct)
        VALUES (10000, 20, 50, 10, 2)
        RETURNING id, bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct
      `;
      return NextResponse.json(created[0]);
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST: تحديث الإعدادات
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid settings', details: parsed.error.issues }, { status: 400 });
    }

    const { bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct } = parsed.data;

    const existing = await sql`SELECT id FROM settings ORDER BY id ASC LIMIT 1`;

    let rows;
    if (existing.length === 0) {
      rows = await sql`
        INSERT INTO settings (bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct)
        VALUES (${bankroll}, ${stop_loss_pct}, ${stop_win_pct}, ${max_daily_bets}, ${bet_size_pct})
        RETURNING id, bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct
      `;
    } else {
      rows = await sql`
        UPDATE settings
        SET bankroll = ${bankroll},
            stop_loss_pct = ${stop_loss_pct},
            stop_win_pct = ${stop_win_pct},
            max_daily_bets = ${max_daily_bets},
            bet_size_pct = ${bet_size_pct}
        WHERE id = ${existing[0].id}
        RETURNING id, bankroll, stop_loss_pct, stop_win_pct, max_daily_bets, bet_size_pct
      `;
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}