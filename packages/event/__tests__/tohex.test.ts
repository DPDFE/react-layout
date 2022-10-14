import { toHex } from '../src/color/tohex';

// keyword
test('red', () => {
    expect(toHex('red')).toBe('#FF0000');
});

// rgb
test('rgb(40 42 54)', () => {
    expect(toHex('rgb(40 42 54)')).toBe('#282a36');
});

// rgb
test('rgb(40  42  54)', () => {
    expect(toHex('rgb(40 42 54)')).toBe('#282a36');
});

// rgb / alpha
test('rgb(40 42 54/0.75)', () => {
    expect(toHex('rgb(40 42 54/0.75)')).toBe('#282a36bf');
});

// rgb / alpha
test('rgb(40 42 54 /     0.75)', () => {
    expect(toHex('rgb(40 42 54 /      0.75)')).toBe('#282a36bf');
});

// rgb / alpha
test('rgb(40 42 54 / 0.75)', () => {
    expect(toHex('rgb(40 42 54 / 0.75)')).toBe('#282a36bf');
});

// number
test('65,131,196', () => {
    expect(toHex(65, 131, 196)).toBe('#4183c4');
});

// alpha
test('65, 131, 196, 0.2', () => {
    expect(toHex(65, 131, 196, 0.2)).toBe('#4183c433');
});

// alpha percent
test('40, 42, 54, 75%', () => {
    expect(toHex(40, 42, 54, '75%')).toBe('#282a36bf');
});

// hex
test('#4183c4', () => {
    expect(toHex('#4183c4')).toBe('#4183c4');
});

// hex alpha
test('#4183c4bf', () => {
    expect(toHex('#4183c4bf')).toBe('#4183c4bf');
});

// rgb
test('rgb(40, 42, 54)', () => {
    expect(toHex('rgb(40, 42, 54)')).toBe('#282a36');
});

// rgb
test('rgb(40,42,54)', () => {
    expect(toHex('rgb(40,42,54)')).toBe('#282a36');
});

// rgba 75%
test('rgba(40,42,54,75%)', () => {
    expect(toHex('rgba(40,42,54,75%)')).toBe('#282a36bf');
});

// rgba 75%
test('rgba(40, 42, 54, 75%)', () => {
    expect(toHex('rgba(40, 42, 54, 75%)')).toBe('#282a36bf');
});

// rgba 0.75
test('rgba(40, 42,   54,   .75)', () => {
    expect(toHex('rgba(40, 42,   54,   .75)')).toBe('#282a36bf');
});

// rgba 0.75
test('rgba(40,42,54,.75)', () => {
    expect(toHex('rgba(40,42,54,.75)')).toBe('#282a36bf');
});

// rgba 0.75
test('rgba(40,42,54,0.75)', () => {
    expect(toHex('rgba(40,42,54,0.75)')).toBe('#282a36bf');
});

// rgba 0
test('rgba(40, 42, 54, 0)', () => {
    expect(toHex('rgba(40, 42, 54, 0)')).toBe('#282a3600');
});

// rgba 1
test('rgba(40, 42, 54, 1)', () => {
    expect(toHex('rgba(40, 42, 54, 1)')).toBe('#282a36ff');
});

// error
test('rgba(276, 42, 54, 1)', () => {
    expect(() => toHex('rgba(276, 42, 54, 1)')).toThrow(
        'Expected three numbers below 256'
    );
});
