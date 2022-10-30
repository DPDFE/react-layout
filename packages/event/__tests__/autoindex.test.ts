import { genAutoId, genAutoIdString } from '../src/autoindex';

test('vfcnmjrv0f', () => {
    const target = genAutoIdString();
    expect(typeof target).toBe('string');
});

test('genAutoId', () => {
    expect(genAutoId({ start: 1 })).toBe(1);
    expect(genAutoId({ start: 1 })).toBe(2);
    expect(genAutoId({ start: 1 })).toBe(3);
    expect(genAutoId({ start: 1 })).toBe(4);
});

test('genAutoId', () => {
    let target: number = genAutoId({ is_next: true });

    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
});
