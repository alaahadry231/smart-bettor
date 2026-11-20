import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

const symbolSchema = z.object({
  symbol_id: z.string().min(1),
});

// GET: جلب كل النتائج
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, symbol_id, created_at
      FROM results
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

// POST: إضافة نتيجة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = symbolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid symbol_id' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO results (symbol_id)
      VALUES (${parsed.data.symbol_id})
      RETURNING id, symbol_id, created_at
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('POST results error:', error);
    return NextResponse.json({ error: 'Failed to add result' }, { status: 500 });
  }
}

// DELETE: حذف آخر نتيجة
export async function DELETE() {
  try {
    const rows = await sql`
      DELETE FROM results
      WHERE id = (SELECT id FROM results ORDER BY id DESC LIMIT 1)
      RETURNING id
    `;
    return NextResponse.json({ deleted: rows[0] ?? null });
  } catch (error) {
    console.error('DELETE results error:', error);
    return NextResponse.json({ error: 'Failed to delete last result' }, { status: 500 });
  }
}

// PUT: حذف كل النتائج
export async function PUT() {
  try {
    await sql`DELETE FROM results`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT results error:', error);
    return NextResponse.json({ error: 'Failed to clear results' }, { status: 500 });
  }
}