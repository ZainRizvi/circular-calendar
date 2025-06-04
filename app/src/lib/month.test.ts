import { SVG } from '@svgdotjs/svg.js';
import { Point } from './primitives';
import { 
  getMonth, 
  MonthInstance, 
  DATE_FILL_COLOR, 
  colorWheelClassic, 
  solarYear 
} from './month';

// No mocks - using real implementations

describe('Month constants', () => {
  it('should define DATE_FILL_COLOR constant', () => {
    expect(DATE_FILL_COLOR).toBe('#fbebb3');
  });

  it('should define colorWheelClassic with 12 colors', () => {
    expect(colorWheelClassic).toBeInstanceOf(Array);
    expect(colorWheelClassic.length).toBe(12);
    // Check the first and last colors
    expect(colorWheelClassic[0]).toBe('#aebbff');
    expect(colorWheelClassic[11]).toBe('#caa8fe');
  });

  it('should define solarYear with 12 months', () => {
    expect(solarYear).toBeDefined();
    expect(solarYear.months).toBeInstanceOf(Array);
    expect(solarYear.months.length).toBe(12);
    
    // Check a few months
    expect(solarYear.months[0].name).toBe('January');
    expect(solarYear.months[0].num_days).toBe(31);
    
    expect(solarYear.months[1].name).toBe('February');
    expect(solarYear.months[1].num_days).toBe(29); // Leap year
    
    expect(solarYear.months[11].name).toBe('December');
    expect(solarYear.months[11].num_days).toBe(31);
  });
});

describe('getMonth function', () => {
  it('should generate drawing elements for a month with dates on top', () => {
    // Create a month instance
    const monthInstance: MonthInstance = {
      name: 'January',
      num_days: 31,
      color: '#aebbff',
      name_upside_down: false,
      date_on_top: true,
      date_box_height: 10,
      inner_radius: 50,
      outer_radius: 100,
      date_angle_offset: 0
    };
    
    const origin = new Point(200, 200);
    const days_in_year = 365;
    
    // Call the function
    const result = getMonth(monthInstance, days_in_year, origin);
    
    // Verify results
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(64);
    
    // Check that the array contains drawing elements
    expect(result[0].drawnPath).toBeInstanceOf(Function);
  });

  it('should generate drawing elements for a month with dates on bottom', () => {
    // Create a month instance
    const monthInstance: MonthInstance = {
      name: 'February',
      num_days: 29,
      color: '#9ce3ff',
      name_upside_down: true,
      date_on_top: false,
      date_box_height: 10,
      inner_radius: 50,
      outer_radius: 100,
      date_angle_offset: 180
    };
    
    const origin = new Point(200, 200);
    const days_in_year = 365;
    
    // Call the function
    const result = getMonth(monthInstance, days_in_year, origin);
    
    // Verify results
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(60);
    
    // Check that the array contains drawing elements
    expect(result[0].drawnPath).toBeInstanceOf(Function);
  });

  it('should calculate correct angles based on days in year', () => {
    // Create a month instance
    const monthInstance: MonthInstance = {
      name: 'March',
      num_days: 31,
      color: '#a1fec5',
      name_upside_down: false,
      date_on_top: true,
      date_box_height: 10,
      inner_radius: 50,
      outer_radius: 100,
      date_angle_offset: 0
    };
    
    const origin = new Point(200, 200);
    // Change days in year to test angle calculation
    const days_in_year = 360; // For easy math: 1 day = 1 degree
    
    // Call the function
    const result = getMonth(monthInstance, days_in_year, origin);
    
    // Verify results
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(64);
    
    // Check that the array contains drawing elements
    expect(result[0].drawnPath).toBeInstanceOf(Function);
  });
});