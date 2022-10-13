import { darken, lighten } from '../src/color';

// darken
// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3')).toBe('rgba(20, 137, 230, 1)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 10 })).toBe('rgba(8, 125, 218, 1)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 20 })).toBe('rgba(0, 99, 192, 1)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 50 })).toBe('rgba(0, 23, 116, 1)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(darken('#2196f3', { percent: 100 })).toBe('rgba(0, 0, 0, 1)');
});

// lighten
// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3')).toBe('rgba(46, 163, 255, 0.95)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 10 })).toBe('rgba(59, 176, 255, 0.9)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 20 })).toBe('rgba(84, 201, 255, 0.8)');
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 50 })).toBe(
        'rgba(161, 255, 255, 0.5)'
    );
});

// rgb / alpha percent
test('#2196f3', () => {
    expect(lighten('#2196f3', { percent: 100 })).toBe('rgba(255, 255, 255, 0)');
});
