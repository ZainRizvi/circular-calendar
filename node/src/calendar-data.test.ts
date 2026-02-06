import { describe, it, expect } from 'vitest';
import {
  Month,
  MonthInstance,
  Year,
  CalendarSettings,
  colorWheelClassic,
  colorHarmony,
  solarYear,
  islamicYearCanonical,
  islamicColors,
  solarColors,
} from './calendar-data.js';

describe('Month type', () => {
  it('should create a month with all required fields', () => {
    const month: Month = {
      number: 1,
      name: 'January',
      numDays: [31],
      color: '#aebbff',
    };
    expect(month.number).toBe(1);
    expect(month.name).toBe('January');
    expect(month.numDays).toEqual([31]);
    expect(month.color).toBe('#aebbff');
  });
});

describe('MonthInstance type', () => {
  it('should create a month instance with all rendering settings', () => {
    const instance: MonthInstance = {
      name: 'January',
      numDays: 31,
      color: '#aebbff',
      nameUpsideDown: false,
      dateOnTop: false,
      dateBoxHeight: 10,
      innerRadius: 100,
      outerRadius: 120,
      dateAngleOffset: 0,
    };
    expect(instance.name).toBe('January');
    expect(instance.numDays).toBe(31);
    expect(instance.nameUpsideDown).toBe(false);
    expect(instance.dateOnTop).toBe(false);
    expect(instance.dateBoxHeight).toBe(10);
    expect(instance.innerRadius).toBe(100);
    expect(instance.outerRadius).toBe(120);
    expect(instance.dateAngleOffset).toBe(0);
  });
});

describe('Year type', () => {
  it('should contain 12 months', () => {
    const months: Month[] = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      name: `Month${i + 1}`,
      numDays: [30],
      color: '#ffffff',
    }));
    const year: Year = { months };
    expect(year.months.length).toBe(12);
  });
});

describe('CalendarSettings type', () => {
  it('should create calendar settings', () => {
    const settings: CalendarSettings = {
      dateOnTop: true,
      dateBoxHeight: 15,
      innerRadius: 80,
      outerRadius: 100,
      daysInYear: 365,
    };
    expect(settings.dateOnTop).toBe(true);
    expect(settings.daysInYear).toBe(365);
  });
});

describe('Color palettes', () => {
  it('colorWheelClassic should have exactly 12 colors', () => {
    expect(colorWheelClassic.length).toBe(12);
  });

  it('colorHarmony should have exactly 12 colors', () => {
    expect(colorHarmony.length).toBe(12);
  });

  it('all colors should be valid hex codes', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    for (const color of colorWheelClassic) {
      expect(color).toMatch(hexPattern);
    }
    for (const color of colorHarmony) {
      expect(color).toMatch(hexPattern);
    }
  });

  it('solarColors should be colorWheelClassic', () => {
    expect(solarColors).toBe(colorWheelClassic);
  });

  it('islamicColors should be colorHarmony', () => {
    expect(islamicColors).toBe(colorHarmony);
  });
});

describe('solarYear', () => {
  it('should have 12 months', () => {
    expect(solarYear.months.length).toBe(12);
  });

  it('should have correct month names in order', () => {
    const expectedNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    solarYear.months.forEach((month, index) => {
      expect(month.name).toBe(expectedNames[index]);
    });
  });

  it('should have correct number of days for each month', () => {
    const expectedDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    solarYear.months.forEach((month, index) => {
      expect(month.numDays[0]).toBe(expectedDays[index]);
    });
  });

  it('should total 366 days (leap year)', () => {
    const totalDays = solarYear.months.reduce(
      (sum, month) => sum + month.numDays[0],
      0
    );
    expect(totalDays).toBe(366);
  });

  it('months should be numbered 1-12', () => {
    solarYear.months.forEach((month, index) => {
      expect(month.number).toBe(index + 1);
    });
  });
});

describe('islamicYearCanonical', () => {
  it('should have 12 months', () => {
    expect(islamicYearCanonical.months.length).toBe(12);
  });

  it('should have correct month names in order', () => {
    const expectedNames = [
      'Muharram',
      'Safar',
      'Rabi al-Awwal',
      'Rabi ath-Thani',
      'Jumada al-Awwal',
      'Jumada ath-Thani',
      'Rajab',
      "Sha'baan",
      'Ramadan',
      'Shawwal',
      "Dhu al-Qa'dah",
      'Dhu al-Hijja',
    ];
    islamicYearCanonical.months.forEach((month, index) => {
      expect(month.name).toBe(expectedNames[index]);
    });
  });

  it('should have 30 days for each month (placeholder)', () => {
    islamicYearCanonical.months.forEach((month) => {
      expect(month.numDays[0]).toBe(30);
    });
  });

  it('should total 360 days (12 × 30)', () => {
    const totalDays = islamicYearCanonical.months.reduce(
      (sum, month) => sum + month.numDays[0],
      0
    );
    expect(totalDays).toBe(360);
  });

  it('months should be numbered 1-12', () => {
    islamicYearCanonical.months.forEach((month, index) => {
      expect(month.number).toBe(index + 1);
    });
  });
});
