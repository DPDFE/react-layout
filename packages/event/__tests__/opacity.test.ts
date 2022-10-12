import { getOpacity } from '../src/color';

// keyword
test('red', () => {
    expect(getOpacity('red')).toBe(1);
});

// rgb
test('rgb(40 42 54)', () => {
    expect(getOpacity('rgb(40 42 54)')).toBe(1);
});

// rgb
test('rgb(40  42  54)', () => {
    expect(getOpacity('rgb(40 42 54)')).toBe(1);
});

// rgb / alpha
test('rgb(40 42 54/0.75)', () => {
    expect(getOpacity('rgb(40 42 54 / 0.75)')).toBe(0.75);
});

// rgb / alpha
test('rgb(40 42 54 /     0.75)', () => {
    expect(getOpacity('rgb(40 42 54 / 0.75)')).toBe(0.75);
});

// rgb / alpha
test('rgb(40 42 54 / 0.75)', () => {
    expect(getOpacity('rgb(40 42 54 / 0.75)')).toBe(0.75);
});

// hex
test('#4183c4', () => {
    expect(getOpacity('#4183c4')).toBe(1);
});

// hex alpha
test('#4183c4bf', () => {
    expect(getOpacity('#4183c4bf')).toBe(0.75);
});

// rgb
test('rgb(40, 42, 54)', () => {
    expect(getOpacity('rgb(40, 42, 54)')).toBe(1);
});

// rgb / alpha percent
test('rgb(40 42 54 / 75%)', () => {
    expect(getOpacity('rgb(40 42 54 / 75%)')).toBe(0.75);
});

// rgba 75%
test('rgba(40, 42, 54, 75%)', () => {
    expect(getOpacity('rgba(40, 42, 54, 75%)')).toBe(0.75);
});

// rgba 0.75
test('rgba(40, 42, 54, .75)', () => {
    expect(getOpacity('rgba(40, 42, 54, .75)')).toBe(0.75);
});

// rgba 0
test('rgba(40, 42, 54, 0)', () => {
    expect(getOpacity('rgba(40, 42, 54, 0)')).toBe(0);
});

// rgba 1
test('rgba(40, 42, 54, 1)', () => {
    expect(getOpacity('rgba(40, 42, 54, 1)')).toBe(1);
});
