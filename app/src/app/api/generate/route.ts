import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LAYOUT_CONFIG,
  getAlignmentParams,
  generateCalendarPdfBytes,
} from '@calendar-lib/index';
import { createResvgRenderer, loadBundledFont } from '@calendar-renderers/index';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Parse a YYYY-MM-DD string into { year, month, day }.
 * Validates that the date is a real calendar date.
 */
function parseDateString(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Validate ranges
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Validate day is valid for this month/year using UTC to avoid timezone issues
  const testDate = new Date(Date.UTC(year, month - 1, day));
  if (testDate.getUTCMonth() !== month - 1 || testDate.getUTCDate() !== day) {
    return null;
  }

  return { year, month, day };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gregorianDate = searchParams.get('gregorian');
    const hijriDate = searchParams.get('hijri');

    // Validate param length to prevent DoS (max reasonable date is 10 chars)
    if (gregorianDate && gregorianDate.length > 20) {
      return NextResponse.json(
        { error: 'Invalid gregorian date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }
    if (hijriDate && hijriDate.length > 20) {
      return NextResponse.json(
        { error: 'Invalid hijri date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Parse date (optional)
    let alignment;
    if (hijriDate) {
      const parsed = parseDateString(hijriDate);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid hijri date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      alignment = getAlignmentParams(undefined, {
        hijriYear: parsed.year,
        hijriMonth: parsed.month,
        hijriDay: parsed.day,
      });
    } else if (gregorianDate) {
      const parsed = parseDateString(gregorianDate);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid gregorian date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      alignment = getAlignmentParams(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)));
    } else {
      alignment = getAlignmentParams(); // Default: today
    }

    // Load bundled font for serverless environment (no system fonts available)
    const fontData = await loadBundledFont();

    const renderer = createResvgRenderer({ dpi: 600, fontData });
    const pdfBytes = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment,
      renderer,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="circle-calendar.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
