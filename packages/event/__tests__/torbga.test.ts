import { RGBFormatType, toRgba } from '../src/color/torgba';

// keyword
test('red', () => {
    expect(toRgba('red')).toBe('rgba(255, 0, 0, 1)');
});

// hex
test('#3c4', () => {
    expect(toRgba('#3c4')).toBe('rgba(51, 204, 68, 1)');
});

// hex
test('#0006', () => {
    expect(toRgba('#0006')).toBe('rgba(0, 0, 0, 0.4)');
});

// hex
test('#4183c4', () => {
    expect(toRgba('#4183c4')).toBe('rgba(65, 131, 196, 1)');
});

// hex
test('#cd2222cc', () => {
    expect(toRgba('#cd2222cc')).toBe('rgba(205, 34, 34, 0.8)');
});

// array
test('#222299', () => {
    expect(toRgba('#222299', { format: RGBFormatType.Array })).toEqual([
        34, 34, 153, 1
    ]);
});

// object
test('#222299', () => {
    expect(toRgba('#222299', { format: RGBFormatType.Object })).toEqual({
        alpha: 1,
        blue: 153,
        green: 34,
        red: 34
    });
});

// alpha
test('#222299', () => {
    expect(toRgba('#222299', { alpha: 1 })).toBe('rgba(34, 34, 153, 1)');
});

// alpha
test('rgb(40 42 54/0.75)', () => {
    expect(toRgba('rgb(40 42 54/0.75)', { alpha: 1 })).toBe(
        'rgba(40, 42, 54, 1)'
    );
});

// rgb / alpha
test('rgb(40 42 54/0.75)', () => {
    expect(toRgba('rgb(40 42 54 / 0.75)')).toBe('rgba(40, 42, 54, 0.75)');
});
