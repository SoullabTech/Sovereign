export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO SERVICES API
 *
 * CRUD operations for practitioner services
 * Manages session types, pricing, duration, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let sql = `
      SELECT
        id, name, description, long_description, category,
        duration_minutes, price_cents,
        is_active, is_featured, display_order,
        includes, created_at, updated_at
      FROM services
      WHERE practitioner_id = $1
    `;
    const params: (string | boolean)[] = [practitionerId];

    if (!includeInactive) {
      sql += ` AND is_active = true`;
    }

    sql += ` ORDER BY display_order ASC, is_featured DESC, name ASC`;

    const result = await db.query(sql, params);

    const services = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      longDescription: row.long_description,
      category: row.category,
      durationMinutes: row.duration_minutes,
      priceCents: row.price_cents,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      displayOrder: row.display_order,
      includes: row.includes || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('[Studio Services] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found for member' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      longDescription,
      category,
      durationMinutes = 60,
      priceCents = 0,
      isActive = true,
      isFeatured = false,
      displayOrder = 0,
      includes = [],
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (durationMinutes < 15 || durationMinutes > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 15 and 480 minutes' },
        { status: 400 }
      );
    }

    if (priceCents < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO services
        (practitioner_id, name, description, long_description, category,
         duration_minutes, price_cents, is_active, is_featured, display_order, includes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        practitionerId,
        name.trim(),
        description?.trim() || null,
        longDescription?.trim() || null,
        category?.trim() || null,
        durationMinutes,
        priceCents,
        isActive,
        isFeatured,
        displayOrder,
        includes,
      ]
    );

    const service = result.rows[0];
    return NextResponse.json({
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        longDescription: service.long_description,
        category: service.category,
        durationMinutes: service.duration_minutes,
        priceCents: service.price_cents,
        isActive: service.is_active,
        isFeatured: service.is_featured,
        displayOrder: service.display_order,
        includes: service.includes || [],
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Services] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found for member' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Build dynamic update
    const updateFields: string[] = [];
    const params: (string | number | boolean | string[] | null)[] = [id, practitionerId];

    if (updates.name !== undefined) {
      if (!updates.name?.trim()) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateFields.push(`name = $${params.length + 1}`);
      params.push(updates.name.trim());
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${params.length + 1}`);
      params.push(updates.description?.trim() || null);
    }

    if (updates.longDescription !== undefined) {
      updateFields.push(`long_description = $${params.length + 1}`);
      params.push(updates.longDescription?.trim() || null);
    }

    if (updates.category !== undefined) {
      updateFields.push(`category = $${params.length + 1}`);
      params.push(updates.category?.trim() || null);
    }

    if (updates.durationMinutes !== undefined) {
      if (updates.durationMinutes < 15 || updates.durationMinutes > 480) {
        return NextResponse.json(
          { error: 'Duration must be between 15 and 480 minutes' },
          { status: 400 }
        );
      }
      updateFields.push(`duration_minutes = $${params.length + 1}`);
      params.push(updates.durationMinutes);
    }

    if (updates.priceCents !== undefined) {
      if (updates.priceCents < 0) {
        return NextResponse.json(
          { error: 'Price cannot be negative' },
          { status: 400 }
        );
      }
      updateFields.push(`price_cents = $${params.length + 1}`);
      params.push(updates.priceCents);
    }

    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${params.length + 1}`);
      params.push(updates.isActive);
    }

    if (updates.isFeatured !== undefined) {
      updateFields.push(`is_featured = $${params.length + 1}`);
      params.push(updates.isFeatured);
    }

    if (updates.displayOrder !== undefined) {
      updateFields.push(`display_order = $${params.length + 1}`);
      params.push(updates.displayOrder);
    }

    if (updates.includes !== undefined) {
      updateFields.push(`includes = $${params.length + 1}`);
      params.push(updates.includes);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE services
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = result.rows[0];
    return NextResponse.json({
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        longDescription: service.long_description,
        category: service.category,
        durationMinutes: service.duration_minutes,
        priceCents: service.price_cents,
        isActive: service.is_active,
        isFeatured: service.is_featured,
        displayOrder: service.display_order,
        includes: service.includes || [],
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Services] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'No practitioner found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Check if service has any sessions
    const sessionsCheck = await db.query(
      `SELECT COUNT(*) as count FROM sessions WHERE service_id = $1`,
      [id]
    );

    if (parseInt(sessionsCheck.rows[0].count) > 0) {
      // Soft delete - just mark inactive
      await db.query(
        `UPDATE services SET is_active = false, updated_at = NOW()
         WHERE id = $1 AND practitioner_id = $2`,
        [id, practitionerId]
      );
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: 'Service has existing sessions and was deactivated instead of deleted'
      });
    }

    const result = await db.query(
      `DELETE FROM services WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Services] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
