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
 */
function parseDateString(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gregorianDate = searchParams.get('gregorian');
    const hijriDate = searchParams.get('hijri');

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
      alignment = getAlignmentParams(new Date(gregorianDate));
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
