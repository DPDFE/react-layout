import { darken, lighten } from '../src/color/computed';

// darken
// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3')).toBe('rgb(31.35, 142.5, 230.85)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 10 })).toBe('rgb(29.7, 135, 218.7)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 20 })).toBe('rgb(26.4, 120, 194.4)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 50 })).toBe(
        'rgb(16.5, 75, 121.49999999999999)'
    );
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 100 })).toBe('rgb(0, 0, 0)');
});

// lighten
// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3')).toBe('rgb(44.1, 155.25, 243.6)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 10 })).toBe('rgb(55.2, 160.5, 244.2)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 20 })).toBe('rgb(77.4, 171, 245.4)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 50 })).toBe('rgb(144, 202.5, 249)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 100 })).toBe('rgb(255, 255, 255)');
});

// max min test error
// test('#2196f3', () => {
//     expect(
//         lighten('#efebeb', { percent: 30, max: '#b75f5f', min: '#efebeb' })
//     ).toBe('rgba(255, 255, 255, 1)');
// });
